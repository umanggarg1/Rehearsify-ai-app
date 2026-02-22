/**
1.Fetch the feedback data from the database
2.Make the Ui
3.Use collapsible template for checking rating, answers, feedback of each question
4.Navigate button to go Home page
*/

"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { use, useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
// run command - npx shadcn@latest add collapsible

import { Activity, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Feedback = ({ params }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const param = use(params);

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, param.interviewId))
      .orderBy(UserAnswer.id);

    console.log("🚀 ~ file: page.jsx:11 ~ GetFeedback ~ result:", result);

    setFeedbackList(result);
    setLoading(false);

    // Calculate the average rating dynamically, only including valid ratings
    const validRatings = result
      .map((item) => parseFloat(item.rating))
      .filter((rating) => !isNaN(rating));

    const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
    const avgRating =
      validRatings.length > 0
        ? (totalRating / validRatings.length).toFixed(1)
        : "N/A";

    setAverageRating(avgRating);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-indigo-600 animate-pulse" />
          <p className="mt-4 text-gray-600">
            Loading your interview feedback...
          </p>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return "text-green-600";
    if (numRating >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-green-600">Congratulations!</h2>
      <h2 className="font-bold text-2xl">Here is your interview feedback</h2>

      {feedbackList?.length == 0 ? (
        <h2 className="font-bold text-lg text-green-500">
          No interview Feedback
        </h2>
      ) : (
        <>
          <h2 className="text-primary text-lg my-2">
            Your overall interview rating:
            <strong
              className={`gap-2 ml-2 text-xl font-bold ${getRatingColor(averageRating)}`}
            >
              {averageRating ? `${averageRating}/10` : "N/A"}
            </strong>
          </h2>

          <h2 className="text-sm text-gray-500">
            Find below interview questions with coreect answers,Your answer and
            feedback for improvements for your next interview
          </h2>

          {feedbackList &&
            feedbackList.map((item, index) => (
              <Collapsible key={index} className="mt-7">
                <CollapsibleTrigger className="p-2 flex justify-between bg-secondary rounded-lg my-2 text-left gap-7 w-full">
                  {item.question} <ChevronsUpDown className="h-4" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-red-500 p-2 border rounded-lg">
                      <strong className="mr-2">Rating:</strong>
                      {item.rating}
                    </h2>

                    <h2 className="p-2 border rounded-lg bg-red-50 text-sm text-red-900">
                      <strong>Your Answer: </strong>
                      {item.userAns}
                    </h2>

                    <h2 className="p-2 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Correct Answer Looks Like: </strong>
                      {item.correctAns}
                    </h2>

                    <h2 className="p-2 border rounded-lg bg-blue-50 text-sm text-primary">
                      <strong>Feedback: </strong>
                      {item.feedback}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}

      <Button className="mt-5" onClick={() => router.replace("/dashboard")}>
        {" "}
        Go Home
      </Button>
    </div>
  );
};

export default Feedback;
