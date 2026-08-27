"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { toast } from "sonner";
import { use } from "react"; // 1. Import 'use'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm text-slate-100">
          {value || "—"}
        </dd>
      </div>
    </div>
  );
}

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const res = use(params);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, res.interviewId));

      if (result.length > 0) {
        setInterviewData(result[0]);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
      console.error("Interview details fetch error:", error);
    }
  };

  const handleWebcamToggle = () => {
    if (!webCamEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setWebCamEnabled(true);
          toast.success("Webcam and microphone enabled");
        })
        .catch((error) => {
          toast.error("Failed to access webcam or microphone");
          console.error("Webcam access error:", error);
        });
    } else {
      setWebCamEnabled(false);
    }
  };

  if (notFound) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Interview not found</h1>
        <p className="text-slate-300">
          This interview doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-700" />
        <div className="mt-6 h-9 w-72 rounded bg-slate-700" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-700" />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="h-60 rounded-lg bg-slate-700" />
            <div className="h-44 rounded-lg bg-slate-700" />
          </div>
          <div className="lg:col-span-2">
            <div className="h-80 rounded-lg bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-white">Let&apos;s Get Started</h1>
        <p className="mt-2 text-slate-300">
          Review your interview details and enable your camera when you&apos;re
          ready.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left column — details */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-lg bg-slate-900 border border-slate-700 p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              Interview Details
            </h2>
            <dl className="divide-y divide-slate-800">
              <DetailRow
                icon={Briefcase}
                label="Job Role / Position"
                value={interviewData.jobPosition}
              />
              <DetailRow
                icon={FileText}
                label="Tech Stack / Description"
                value={interviewData.jobDesc}
              />
              <DetailRow
                icon={Clock}
                label="Years of Experience"
                value={interviewData.jobExperience}
              />
            </dl>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-amber-300">
              <Lightbulb className="h-5 w-5" />
              Before you begin
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-amber-200/90">
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>5 AI-generated questions
                based on your role and experience.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>Answer by voice — your
                response is transcribed in real time.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>You get a rating and
                improvement feedback for every answer.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400">•</span>Your video is never
                recorded or stored. Disable the camera anytime.
              </li>
            </ul>
          </div>
        </div>

        {/* Right column — camera */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-slate-900 border border-slate-700 p-6 lg:sticky lg:top-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Video className="h-5 w-5 text-indigo-400" />
              Camera &amp; Microphone
            </h2>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
              {webCamEnabled ? (
                <Webcam
                  mirrored={true}
                  className="h-full w-full object-cover"
                  onUserMedia={() => setWebCamEnabled(true)}
                  onUserMediaError={() => {
                    toast.error("Webcam access error");
                    setWebCamEnabled(false);
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                  <WebcamIcon className="h-12 w-12" />
                  <p className="text-sm">Camera is off</p>
                </div>
              )}

              {webCamEnabled && (
                <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Live preview
                </span>
              )}
            </div>

            <Button
              className="mt-4 w-full"
              variant={webCamEnabled ? "outline" : "default"}
              onClick={handleWebcamToggle}
            >
              {webCamEnabled ? (
                <>
                  <VideoOff className="mr-2 h-4 w-4" />
                  Disable Camera
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Enable Camera &amp; Microphone
                </>
              )}
            </Button>

            <div className="mt-3 flex items-center gap-2 text-sm">
              {webCamEnabled ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-green-300">Ready to go</span>
                </>
              ) : (
                <span className="text-slate-400">
                  Camera access is recommended but optional.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-8 flex flex-col-reverse gap-4 rounded-lg bg-slate-900 border border-slate-700 p-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
        </Link>

        <Link
          href={`/dashboard/interview/${res.interviewId}/start`}
          className="w-full sm:w-auto"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Start Interview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Interview;
