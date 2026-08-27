"use client";
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Ensure 'model' is inside the curly braces
import { chatSession, model } from "@/utils/GeminiAIModel";
import { LoaderCircle, Sparkles } from "lucide-react";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/utils/db";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Job Role Suggestions
const JOB_ROLE_SUGGESTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Software Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Mobile App Developer",
  "UI/UX Designer",
];

// Tech Stack Suggestions
const TECH_STACK_SUGGESTIONS = {
  "Full Stack Developer": "React, Node.js, Express, MongoDB, TypeScript",
  "Frontend Developer": "React, Vue.js, Angular, TypeScript, Tailwind CSS",
  "Backend Developer": "Python, Django, Flask, Java Spring, PostgreSQL",
  "Software Engineer": "Java, C++, Python, AWS, Microservices",
  "DevOps Engineer": "Docker, Kubernetes, Jenkins, AWS, Azure",
  "Data Scientist": "Python, TensorFlow, PyTorch, Pandas, NumPy",
  "Machine Learning Engineer": "Python, scikit-learn, Keras, TensorFlow",
  "Cloud Engineer": "AWS, Azure, GCP, Terraform, Kubernetes",
  "Mobile App Developer": "React Native, Flutter, Swift, Kotlin",
  "UI/UX Designer": "Figma, Sketch, Adobe XD, InVision",
};

function AddNewInterview() {
  
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  // Auto-suggest tech stack based on job role
  const autoSuggestTechStack = (role) => {
    const suggestion = TECH_STACK_SUGGESTIONS[role];
    if (suggestion) {
      setJobDescription(suggestion);
      toast.info(`Auto-filled tech stack for ${role}`);
    }
  };

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const inputPrompt = `Job position: ${jobPosition}, Job Description: ${jobDescription}, Years of Experience: ${jobExperience}, Based on the Job Position, Job Description and Years of Experience, give us exactly ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions along with answers in JSON format. Each object in the array should have "question" and "answer" fields. First qiestion is about the intro and previous projects, then comes the question about the topic. Return ONLY the JSON array.`;

    try {
   
      const generationConfig = {
        temperature: 1,
        maxOutputTokens: 8192,
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(inputPrompt);
      const rawResponse = await result.response.text();

      // 1. Improved Cleaning: Removes markdown code blocks and trims whitespace
      const cleanedResponse = rawResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      // 2. Extract JSON array using a more reliable regex
      const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error("No valid JSON array found in the response");
      }

      const jsonResponsePart = jsonMatch[0];
      const mockResponse = JSON.parse(jsonResponsePart);

      if (mockResponse) {
   
        setJsonResponse(mockResponse);
        const jsonString = JSON.stringify(mockResponse);

        const res = await db
          .insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: jsonString,
            jobPosition: jobPosition,
            jobDesc: jobDescription,
            jobExperience: jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            createdAt: moment().format("DD-MM-YYYY"),
          })
          .returning({ mockId: MockInterview.mockId });

        toast.success("Interview questions generated successfully!");
        router.push(`/dashboard/interview/${res[0]?.mockId}`);
   
      }
    } catch (error) {
  
      console.error("Error fetching interview questions:", error);
      toast.error("Failed to parse AI response. Please try again.");
  
    } finally {
  
      setLoading(false);
  
    }
  
  };

  return (
    <div>
      {/* Add New Card */}
      <div
        className="p-10 border border-slate-700 rounded-2xl bg-slate-800 hover:border-slate-600 hover:bg-slate-700/60 cursor-pointer transition-all flex items-center justify-center"
        onClick={() => setOpenDialog(true)}
      >
        <h1 className="font-semibold text-lg text-slate-200">
          + Add New Interview
        </h1>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-slate-900 border-slate-700 text-slate-200">

          <DialogHeader>
            <DialogTitle className="font-bold text-2xl text-center text-white">
              🚀 Setup Your Interview
            </DialogTitle>
          </DialogHeader>

          <DialogDescription asChild>
            <form onSubmit={onSubmit} className="space-y-6 mt-4">

              <p className="text-sm text-slate-400 text-center">
                Fill in the details to generate AI-powered interview questions
              </p>

              {/* Job Role */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Job Role / Position
                </label>

                <div className="flex items-center gap-2 mt-2">
                  <Input
                    className="rounded-xl bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                    placeholder="Ex. Full Stack Developer"
                    required
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    list="jobRoles"
                  />

                  <datalist id="jobRoles">
                    {JOB_ROLE_SUGGESTIONS.map((role) => (
                      <option key={role} value={role} />
                    ))}
                  </datalist>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-slate-600 bg-transparent hover:bg-slate-800"
                    onClick={() => autoSuggestTechStack(jobPosition)}
                    disabled={!jobPosition}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </Button>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Tech Stack / Job Description
                </label>

                <Textarea
                  className="rounded-xl mt-2 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="Ex. React, Node.js, MongoDB, Express..."
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Years of Experience
                </label>

                <Input
                  className="rounded-xl mt-2 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="Ex. 2"
                  type="number"
                  min="0"
                  max="70"
                  value={jobExperience}
                  required
                  onChange={(e) => setJobExperience(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="px-6 rounded-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin h-4 w-4" />
                      Generating...
                    </div>
                  ) : (
                    "Start Interview"
                  )}
                </Button>
              </div>

            </form>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
