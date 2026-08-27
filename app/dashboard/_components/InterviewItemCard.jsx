import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const InterviewItemCard = ({ interview }) => {
  
  const router = useRouter()
  
  const onStart=()=>{
      router.push('/dashboard/interview/'+interview?.mockId)
  }
  
  const onFeedbackPress=()=>{
      router.push('/dashboard/interview/'+interview.mockId+"/feedback")
  }
  
  return (
    <div className="border border-slate-700 bg-slate-900 rounded-lg p-3">

      <h2 className="font-bold text-indigo-400">{interview?.jobPosition}</h2>
      <h2 className="text-sm text-slate-400">{interview?.jobExperience} Years of Experience</h2>

      <h2 className="text-xs text-slate-500">
        Created At: {interview?.createdAt}
      </h2>

      <div className="flex justify-between gap-5 mt-2">

        <Button
          size="sm"
          variant="outline"
          className="w-half border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
          onClick={onFeedbackPress}
        >
          Feedback
        </Button>
        <Button className="w-50%" size="sm" onClick={onStart}>Start</Button>

      </div>

    </div>
  );
};

export default InterviewItemCard;