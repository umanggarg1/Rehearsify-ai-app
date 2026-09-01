/**
1.
*/

"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Loader2, Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { saveAnswer } from "@/utils/actions";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onAnswerSave,
}) => {
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  
  //for speech to text, imported from npmjs.com/package/react-hook-speech-to-text
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    lang: "en-IN", // 🔥 important
  });
  
  
  useEffect(() => {
    // Build the answer from finalized segments only, dropping consecutive
    // duplicates (Chrome's continuous recognition can emit the same segment
    // twice).
    const finalText = results
      .map((r) => (typeof r === "string" ? r : r.transcript))
      .map((t) => (t || "").trim())
      .filter((t, i, arr) => t && t !== arr[i - 1])
      .join(" ")
      .trim();

    // Append the live interim text only while recording, and only if it isn't
    // just echoing what's already been finalized.
    const interim = (interimResult || "").trim();
    const showInterim =
      isRecording && interim && !finalText.endsWith(interim) ? ` ${interim}` : "";

    setUserAnswer((finalText + showInterim).trim());
  }, [results, interimResult, isRecording]);

  
  
  const StartStopRecording = async () => {
    if (isRecording) {
      stopSpeechToText();
      if ((userAnswer?.trim().length ?? 0) < 5) {
        toast("Didn't catch that — please record your answer again.");
      }
    } else {
      setUserAnswer(""); // reset
      setResults([]);
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    setLoading(true);

    try {
      await saveAnswer({
        mockId: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
      });

      toast.success("User Answer recorded successfully");
      setUserAnswer("");
      setResults([]);

      if (typeof onAnswerSave === "function") {
        onAnswerSave();
      }
    } catch (error) {
      console.error("Error saving user answer:", error);
      toast.error("Couldn't save your answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-cente items-center flex-col">

      {loading && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex flex-col justify-center items-center">
          <Loader2 className="h-16 w-16 animate-spin text-white mb-4" />
          <p className="text-white text-lg">Saving your answer...</p>
        </div>
      )}

      <div className="relative flex flex-col my-20 justify-center items-center bg-black rounded-lg p-5 overflow-hidden">

        <Image
          src={"/webcam.png"}
          width={140}
          height={140}
          className="absolute opacity-40"
          alt=""
          priority
        />
        <Webcam
          style={{ height: 300, width: "100%", zIndex: 10 }}
          mirrored={true}
          audio={false}
          onUserMediaError={(e) => {
            console.error("Webcam error:", e);
            toast.error(
              "Can't access your camera. Check the browser's camera permission and that no other app (Zoom, Teams, OBS…) is using it."
            );
          }}
        />
      </div>

      {error && (
        <div className="w-full rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Speech-to-text isn&apos;t available in this browser (needs Chrome or
          Edge; Brave blocks it by default). Type your answer in the box below and
          click <strong>Save Answer</strong>.
        </div>
      )}

      <Button
        disabled={loading || !!error}
        variant="outline"
        className="my-3 border-slate-600 bg-transparent hover:bg-slate-800"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-400 items-center animate-pulse flex gap-2">
            <StopCircle /> Stop Recording...
          </h2>
        ) : (
          <h2 className="text-indigo-300 flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>

      {!error && (
        <p className="text-xs text-slate-500">
          Voice input works best in Chrome or Edge. On other browsers, type your
          answer below.
        </p>
      )}

      <textarea
        className="w-full h-32 p-4 mt-2 border border-slate-700 bg-slate-950 rounded-md text-white placeholder:text-slate-500"
        placeholder="Your answer will appear here..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
 
      <Button
        className="mt-4 my-2"
        onClick={async () => {
          if (isRecording) {
            stopSpeechToText(); // ✅ stop recording first
            await new Promise((res) => setTimeout(res, 800)); // ⏳ wait for final transcript
          }
          await UpdateUserAnswer(); // then save
        }}
        disabled={loading || !userAnswer.trim()}
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
        ) : (
          "Save Answer"
        )}
      </Button>
    </div>
  );
};

export default RecordAnswerSection;