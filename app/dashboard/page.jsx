"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Bot, Plus, ListChecks, Trophy, Zap, TrendingUp } from "lucide-react";

import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import { getUserAnswers } from "@/utils/actions";

function Dashboard() {
  const { user } = useUser();
  const [interviewData, setInterviewData] = useState([]);
  const [isNewInterviewModalOpen, setIsNewInterviewModalOpen] = useState(false);
  const [statsCards, setStatsCards] = useState([
    {
      icon: <ListChecks size={32} className="text-indigo-400" />,
      title: "Total Interviews",
      value: "0",
    },
    {
      icon: <Trophy size={32} className="text-green-400" />,
      title: "Best Score",
      value: "N/A",
    },
    {
      icon: <TrendingUp size={32} className="text-blue-400" />,
      title: "Improvement Rate",
      value: "0%",
    },
  ]);

  const fetchInterviews = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    try {
      const { answers } = await getUserAnswers();
      const userSpecificInterviews = answers || [];

      setInterviewData(userSpecificInterviews);

      const averageRatings = Object.values(
        userSpecificInterviews.reduce((acc, item) => {
          const mockId = item.mockIdRef;
          const numericRating = Number(item.rating);

          if (!acc[mockId]) {
            // Initialize the tracking object for this ID
            acc[mockId] = {
              mockId: mockId,
              totalRating: isNaN(numericRating) ? 0 : numericRating,
              count: 1,
            };
          } else {
            // Add to the existing sum and increment the counter
            acc[mockId].totalRating += isNaN(numericRating) ? 0 : numericRating;
            acc[mockId].count += 1;
          }
          return acc;
        }, {}),
      ).map((group) => ({
        mockId: group.mockId,
        // Calculate the average: Sum / Count
        averageRating: parseFloat((group.totalRating / group.count).toFixed(1)),
      }));

      // Calculate and update stats
      const totalInterviews = averageRatings.length;
      const ratingValues = userSpecificInterviews
        .map((item) => parseInt(item.rating || "0", 10))
        .filter((n) => !isNaN(n));
      const bestScore = ratingValues.length > 0 ? Math.max(...ratingValues) : 0;
      const improvementRate = calculateImprovementRate(userSpecificInterviews);

      setStatsCards([
        {
          ...statsCards[0],
          value: totalInterviews.toString(),
        },
        {
          ...statsCards[1],
          value: bestScore ? `${bestScore}/10` : "N/A",
        },
        {
          ...statsCards[2],
          value: `${improvementRate}%`,
        },
      ]);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error(error.message || "Failed to fetch interviews");
    }
  };

  const calculateImprovementRate = (interviews) => {
    if (interviews.length <= 1) return 0;

    const scores = interviews
      .map((interview) => parseInt(interview.rating || "0", 10))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (scores.length <= 1) return 0;

    const lowest = scores[0];
    const highest = scores[scores.length - 1];
    if (lowest <= 0) return 0;

    return Math.round(((highest - lowest) / lowest) * 100);
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchInterviews();
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">

      {/* User Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="text-indigo-400" size={32} />
            Dashboard
          </h2>
          <h3 className="text-lg sm:text-xl text-slate-300 mt-2">
            Welcome, {user?.firstName || "Interviewer"}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm sm:text-base">
            {user?.primaryEmailAddress?.emailAddress || "Not logged in"}
          </span>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="bg-slate-900 border border-slate-700 p-4 sm:p-6 rounded-lg transition-all hover:border-slate-600 flex items-center"
          >
            {card.icon}
            <div className="ml-4">
              <p className="text-xs sm:text-sm text-slate-400">{card.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interview Section */}
      <div className="bg-slate-900 border border-slate-700 p-4 sm:p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-3">
            <Zap size={24} className="text-yellow-400" />
            Create AI Mock Interview
          </h2>
          <button
            onClick={() => setIsNewInterviewModalOpen(true)}
            className="flex items-center bg-[#4845D2] text-white px-4 py-2 rounded-full hover:bg-[#3f3cbf] transition-colors"
          >
            <Plus size={20} className="mr-2" />
            New Interview
          </button>
        </div>

        {/* Add New Interview Component */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <AddNewInterview
            isOpen={isNewInterviewModalOpen}
            onClose={() => setIsNewInterviewModalOpen(false)}
          />
        </div>
      </div>

      {/* Interview History */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">
          Interview History
        </h2>
        <InterviewList interviews={interviewData} />
      </div>
    </div>
  );
}

export default Dashboard;
