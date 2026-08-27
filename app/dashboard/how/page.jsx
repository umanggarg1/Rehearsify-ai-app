import Link from "next/link";
import { ArrowLeft, UserCog, Mic, MessageSquareText } from "lucide-react";

const STEPS = [
  {
    icon: UserCog,
    title: "1. Set up your interview",
    body: "Enter your job role, tech stack, and years of experience. The AI generates 5 questions tailored to you.",
  },
  {
    icon: Mic,
    title: "2. Answer out loud",
    body: "Enable your camera and mic, then answer each question by voice. Your response is transcribed live.",
  },
  {
    icon: MessageSquareText,
    title: "3. Get feedback",
    body: "Every answer gets an AI rating and specific notes on what to improve. Review it all on the feedback page.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-white">How it works</h1>
      <p className="mt-2 text-slate-300">Three steps from setup to feedback.</p>

      <div className="mt-8 space-y-4">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex gap-4 rounded-lg border border-slate-700 bg-slate-900 p-6"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-white">{title}</h2>
              <p className="mt-1 text-sm text-slate-300">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-md bg-[#4845D2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3f3cbf]"
      >
        Start an interview
      </Link>
    </div>
  );
}
