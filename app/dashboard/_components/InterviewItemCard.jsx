import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const InterviewItemCard = ({ interview }) => {
  
  const router = useRouter()
  
  const onStart=()=>{
      router.push('/dashboard/interview/'+interview?.mockId)
  }
  
  const onFeedbackPress=()=>{
      router.push('dashboard/interview/'+interview.mockId+"/feedback")
  }
  
  return (
    <div className="border shadow-sm rounded-lg p-3">
    
      <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>
      <h2 className="text-sm text-gray-500">{interview?.jobExperience} Year of Experiance</h2>
    
      <h2 className="text-xs text-gray-400">
        Created At: {interview?.createdAt}
      </h2>
    
      <div className="flex justify-between gap-5 mt-2">
        
        <Button size="sm" variant="outline" className="w-half" onClick={onFeedbackPress} >
          Feedback
        </Button>
        <Button className="w-50%" size="sm" onClick={onStart}>Start</Button>
    
      </div>
    
    </div>
  );
};

export default InterviewItemCard;