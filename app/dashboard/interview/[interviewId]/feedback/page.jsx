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
import { toast } from "sonner";

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
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, param.interviewId))
        .orderBy(UserAnswer.id);

      setFeedbackList(result);

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
    } catch (error) {
      console.error("Failed to load interview feedback:", error);
      toast.error("Couldn't load your feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-indigo-400 animate-pulse" />
          <p className="mt-4 text-slate-300">
            Loading your interview feedback...
          </p>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 8) return "text-green-400";
    if (numRating >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const formatRating = (rating) => {
    const num = parseFloat(rating);
    return isNaN(num) ? "N/A" : `${num}/10`;
  };

  const hasFeedback = feedbackList?.length > 0;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        {hasFeedback ? (
          <>
            <h2 className="text-4xl font-bold text-green-600">
              🎉 Congratulations!
            </h2>
            <p className="text-slate-400 mt-2">
              Here’s a detailed breakdown of your interview performance
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-white">No feedback yet</h2>
            <p className="text-slate-400 mt-2">
              You haven’t recorded any answers for this interview.
            </p>
          </>
        )}
      </div>

      {feedbackList?.length == 0 ? (
        <div className="text-center mt-10">
          <h2 className="font-semibold text-lg text-slate-400">
            No interview feedback available
          </h2>
        </div>
      ) : (
        <>
          {/* Overall Rating Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
            <h2 className="text-lg text-slate-300">
              Overall Interview Rating
            </h2>

            <div className="mt-2">
              <span
                className={`text-3xl font-bold ${getRatingColor(
                  averageRating
                )}`}
              >
                {averageRating ? `${averageRating}/10` : "N/A"}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6">
            Review each question below along with your answer, the ideal answer,
            and suggestions to improve for your next interview.
          </p>

          {/* Questions */}
          <div className="space-y-4">
            {feedbackList &&
              feedbackList.map((item, index) => (
                <Collapsible key={index}>
                  <CollapsibleTrigger className="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-left text-slate-100">
                    <span className="font-medium">
                      Q{index + 1}. {item.question}
                    </span>
                    <ChevronsUpDown className="h-4 text-slate-400" />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-3 space-y-3 p-4 border border-slate-700 rounded-xl bg-slate-900">

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-300">
                          Rating
                        </span>
                        <span
                          className={`font-semibold ${getRatingColor(
                            item.rating
                          )}`}
                        >
                          {formatRating(item.rating)}
                        </span>
                      </div>

                      {/* Your Answer */}
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200">
                        <strong>Your Answer:</strong>
                        <p className="mt-1">{item.userAns}</p>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-200">
                        <strong>Ideal Answer:</strong>
                        <p className="mt-1">{item.correctAns}</p>
                      </div>

                      {/* Feedback */}
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200">
                        <strong>Feedback:</strong>
                        <p className="mt-1">{item.feedback}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </>
      )}

      {/* Footer Button */}
      <div className="flex justify-center mt-10">
        <Button
          className="px-6 py-2 rounded-xl"
          onClick={() => router.replace("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Feedback;
