"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { newChatSession } from "@/utils/GeminiAIModel";

/** Resolve the signed-in user's primary email, or throw. */
async function requireEmail() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.find((e) => e.id === user?.primaryEmailAddressId)
      ?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress;

  if (!email) throw new Error("No email address on account");
  return email;
}

/** Pull the first JSON array/object out of a model response. */
function extractJson(text) {
  const cleaned = (text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const match = cleaned.match(/[[{][\s\S]*[\]}]/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]);
}

/** Load an interview and verify it belongs to `email`. */
async function getOwnedInterview(mockId, email) {
  const [row] = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.mockId, mockId));

  if (!row) return { notFound: true };
  if (row.createdBy !== email) throw new Error("Forbidden");
  return { interview: row };
}

export async function createInterview({ jobPosition, jobDesc, jobExperience }) {
  const email = await requireEmail();

  if (!jobPosition?.trim() || !jobDesc?.trim() || !jobExperience?.toString().trim()) {
    throw new Error("Missing required fields");
  }

  const count = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5;
  const prompt =
    `Job position: ${jobPosition}, Job Description: ${jobDesc}, ` +
    `Years of Experience: ${jobExperience}. Based on this, give exactly ${count} ` +
    `interview questions with answers as a JSON array. Each object must have ` +
    `"question" and "answer" string fields. The first question should be about the ` +
    `candidate's introduction and previous projects; the rest about the role and ` +
    `tech stack. Return ONLY the JSON array.`;

  const chat = newChatSession();
  const result = await chat.sendMessage(prompt);
  const questions = extractJson(result.response.text());

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("AI did not return any questions");
  }

  const mockId = uuidv4();
  await db.insert(MockInterview).values({
    mockId,
    jsonMockResp: JSON.stringify(questions),
    jobPosition,
    jobDesc,
    jobExperience: String(jobExperience),
    createdBy: email,
    createdAt: moment().format("DD-MM-YYYY"),
  });

  return { mockId };
}

export async function getInterview(mockId) {
  const email = await requireEmail();
  const res = await getOwnedInterview(mockId, email);
  if (res.notFound) return { notFound: true };

  let questions = [];
  try {
    questions = JSON.parse(res.interview.jsonMockResp) || [];
  } catch {
    questions = [];
  }
  return { interview: res.interview, questions };
}

export async function saveAnswer({ mockId, question, correctAns, userAns }) {
  const email = await requireEmail();

  const res = await getOwnedInterview(mockId, email);
  if (res.notFound) throw new Error("Interview not found");
  if (!userAns?.trim()) throw new Error("Empty answer");

  const prompt =
    `Question: ${question}\nUser Answer: ${userAns}\n` +
    `Rate this answer and give feedback as areas of improvement in 3 to 5 lines. ` +
    `Return ONLY JSON: {"rating": "<number 1-10>", "feedback": "<text>"}`;

  const chat = newChatSession();
  const result = await chat.sendMessage(prompt);
  const parsed = extractJson(result.response.text());

  await db.insert(UserAnswer).values({
    mockIdRef: mockId,
    question,
    correctAns,
    userAns,
    feedback: parsed?.feedback ?? null,
    rating: parsed?.rating != null ? String(parsed.rating) : null,
    userEmail: email,
    createdAt: moment().format("DD-MM-YYYY"),
  });

  return { ok: true, rating: parsed?.rating, feedback: parsed?.feedback };
}

export async function getFeedback(mockId) {
  const email = await requireEmail();

  const res = await getOwnedInterview(mockId, email);
  if (res.notFound) return { notFound: true, answers: [] };

  const answers = await db
    .select()
    .from(UserAnswer)
    .where(eq(UserAnswer.mockIdRef, mockId))
    .orderBy(UserAnswer.id);

  return { answers };
}

export async function getUserAnswers() {
  const email = await requireEmail();
  const answers = await db
    .select()
    .from(UserAnswer)
    .where(eq(UserAnswer.userEmail, email));
  return { answers };
}

export async function getInterviewList() {
  const email = await requireEmail();
  const interviews = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.createdBy, email))
    .orderBy(desc(MockInterview.id));
  return { interviews };
}
