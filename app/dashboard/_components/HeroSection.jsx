import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ListChecks, Mic, LineChart } from "lucide-react";

const FEATURES = [
  { icon: ListChecks, label: "5 role-tailored questions" },
  { icon: Mic, label: "Voice answers, live transcript" },
  { icon: LineChart, label: "Instant AI rating & feedback" },
];

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-800">
      {/* top gradient blob */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#4845D2] to-[#8b5cf6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        {/* badge */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/dashboard/how"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm leading-6 text-slate-300 ring-1 ring-white/15 transition hover:ring-white/25"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            AI-powered interview practice
            <span aria-hidden="true" className="font-semibold text-indigo-400">
              Read more &rarr;
            </span>
          </Link>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Your Personal{" "}
            <span className="text-indigo-400">AI Interview Coach</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 sm:text-xl">
            Double your chances of landing that job offer with our AI-powered
            interview prep.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Get started
              </Button>
            </Link>
            <Link
              href="/dashboard/how"
              className="text-sm font-semibold leading-6 text-white transition hover:text-indigo-400"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* feature strip */}
          <dl className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-4 text-sm text-slate-300 sm:flex-row sm:gap-8">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-indigo-400" />
                <dt>{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* bottom gradient blob */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#8b5cf6] to-[#4845D2] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
    </section>
  );
}
