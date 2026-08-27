import Link from "next/link";
import { ArrowLeft, ListChecks } from "lucide-react";

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
          <ListChecks className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">Questions</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-300">
          Browse the AI-generated questions from your interviews and revisit the
          model answers. This page is coming soon.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-[#4845D2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3f3cbf]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
