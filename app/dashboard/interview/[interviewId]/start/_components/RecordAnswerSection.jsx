/**
1.
*/

"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
  // `listening` = the user's intent (Record pressed, Stop not yet). It stays
  // true through the brief gaps when the Web Speech API ends itself on silence.
  const [listening, setListening] = useState(false);
  const keepListeningRef = useRef(false);
  const restartStampsRef = useRef([]);

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
    // `results` is the growing list of finalized utterances — join them all.
    const finalText = results
      .map((r) => (typeof r === "string" ? r : r.transcript))
      .map((t) => (t || "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    // While listening, show the live interim tail too — but skip it if it's just
    // re-showing what was already finalized (avoids the phrase appearing twice).
    const interim = (interimResult || "").trim();
    const showInterim =
      listening && interim && !finalText.endsWith(interim) ? ` ${interim}` : "";

    setUserAnswer((finalText + showInterim).trim());
  }, [results, interimResult, listening]);

  const beginListening = () => {
    keepListeningRef.current = true;
    restartStampsRef.current = [];
    setListening(true);
    startSpeechToText();
  };

  const endListening = () => {
    keepListeningRef.current = false;
    setListening(false);
    stopSpeechToText();
  };

  // The Web Speech API ends itself after a pause/silence (Chrome ignores
  // `continuous` in practice). Restart it as long as the user hasn't pressed
  // Stop, so pauses don't end the recording. Bail out if it thrashes.
  useEffect(() => {
    if (isRecording || !keepListeningRef.current) return;

    const now = Date.now();
    restartStampsRef.current = restartStampsRef.current.filter(
      (t) => now - t < 10000
    );
    if (restartStampsRef.current.length >= 6) {
      keepListeningRef.current = false;
      setListening(false);
      toast.error(
        "Voice recording keeps dropping — check your mic/connection, or type your answer."
      );
      return;
    }
    restartStampsRef.current.push(now);

    const id = setTimeout(() => {
      if (!keepListeningRef.current || isRecording) return;
      try {
        startSpeechToText();
      } catch (e) {
        console.error("speech restart failed:", e);
        setTimeout(() => {
          if (keepListeningRef.current && !isRecording) {
            try {
              startSpeechToText();
            } catch (err) {
              console.error("speech restart retry failed:", err);
            }
          }
        }, 500);
      }
    }, 120); // keep the un-listening gap short so few words are missed
    return () => clearTimeout(id);
    // startSpeechToText is intentionally excluded — we only react to isRecording
    // flipping to false, not to the hook re-creating its callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const StartStopRecording = async () => {
    if (listening) {
      endListening();
      if ((userAnswer?.trim().length ?? 0) < 5) {
        toast("Didn't catch that — please record your answer again.");
      }
    } else {
      setUserAnswer(""); // reset
      setResults([]);
      beginListening();
    }
  };

  const UpdateUserAnswer = async () => {
    setLoading(true);

    try {
      const res = await saveAnswer({
        mockId: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: userAnswer,
      });

      if (!res?.ok) {
        toast.error(
          res?.reason === "ai_busy"
            ? "The AI is busy right now. Your answer is still here — try Save again in a moment."
            : res?.reason === "rate_limited"
              ? res.message || "Too many requests — slow down a moment."
              : "Couldn't save your answer. Please try again."
        );
        return; // keep userAnswer so they can retry
      }

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
        disabled={loading}
        variant="outline"
        className="my-3 border-slate-600 bg-transparent hover:bg-slate-800"
        onClick={StartStopRecording}
      >
        {listening ? (
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
          if (listening || isRecording) {
            endListening(); // stop recording first (and don't auto-restart)
            await new Promise((res) => setTimeout(res, 800)); // wait for final transcript
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