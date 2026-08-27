"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { getInterviewList } from "@/utils/actions";

// Fetches its own list (newest-first) via a server action, so it stays correct
// even if the parent passes stale data.
const InterviewList = () => {
  const { user } = useUser();
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    if (user) GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      const { interviews: list } = await getInterviewList();
      setInterviews(list || []);
    } catch (error) {
      console.error("Failed to load interview list:", error);
    }
  };

  return (
    <div>
      <h2 className="font-medium text-xl text-white">Previous Mock Interview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
        {interviews &&
          interviews.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))}
      </div>
    </div>
  );
};

export default InterviewList;
