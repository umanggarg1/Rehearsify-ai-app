"use client"
import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

const QuestionsSection = ({mockInterviewQuestion,activeQuestionIndex}) => {

  const textToSpeach=(text)=>{
    if('speechSynthesis' in window){
        const speech = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speech)
    }else{
        toast.error("Sorry, your browser does not support text to speech")
    }
  }

  return mockInterviewQuestion && (
    <div className='p-5 border border-slate-700 bg-slate-900 rounded-lg my-10'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
            {mockInterviewQuestion && mockInterviewQuestion.map((question,index)=>(
                <h2 key={index} className={`p-2 rounded-full text-xs md:text-sm text-center cursor-pointer ${activeQuestionIndex == index ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'}`}>Question #{index+1}</h2>
            ))}
        </div>
            <h2 className='my-5 text-md md:text-lg text-slate-100'>
                {mockInterviewQuestion[activeQuestionIndex]?.question}
            </h2>

            <Volume2 className='cursor-pointer text-slate-300 hover:text-white' onClick={()=>textToSpeach(mockInterviewQuestion[activeQuestionIndex]?.question)}/>

            <div className='border border-indigo-500/20 rounded-lg p-5 bg-indigo-500/10 mt-20'>
                <h2 className='flex gap-2 items-center text-indigo-300'>
                    <Lightbulb/>
                    <strong>Note:</strong>
                </h2>
                <h2 className='text-sm text-indigo-300 my-2'>Click on Record Answer when you want to answer the question. At the end of interview we will give you the feedback along with correct answer for each of question and your answer to compare it.</h2>
            </div>
    </div>
  )
}

export default QuestionsSection