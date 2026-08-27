import HeroSection from "./dashboard/_components/HeroSection";
import Link from "next/link";
import {
  LayoutDashboard,
  ListChecks,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const SECTIONS = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    href: "/dashboard",
    description:
      "Your home base — start a new mock interview and track total sessions, best score, and improvement rate.",
  },
  {
    icon: ListChecks,
    title: "Questions",
    href: "/dashboard/questions",
    description:
      "Browse the AI-generated questions from your interviews and revisit the model answers any time.",
  },
  {
    icon: Sparkles,
    title: "Upgrade",
    href: "/dashboard/upgrade",
    description:
      "Unlock more interviews, longer sessions, and deeper feedback with a Pro plan.",
  },
  {
    icon: HelpCircle,
    title: "How it works",
    href: "/dashboard/how",
    description:
      "A quick walkthrough: set up your role, answer by voice, and get instant AI feedback.",
  },
];

export default function Home() {
  return (
    <>
      <HeroSection />

      <section className="bg-slate-800 px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore the app
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Four places to get you from setup to offer.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          {SECTIONS.map(({ icon: Icon, title, href, description }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-900/60 p-6 transition hover:border-indigo-500/60 hover:bg-slate-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                {description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-400">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
