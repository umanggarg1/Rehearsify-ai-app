import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    features: ["3 mock interviews", "5 questions per interview", "Basic feedback"],
    cta: "Current plan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    features: [
      "Unlimited mock interviews",
      "Up to 10 questions per interview",
      "In-depth feedback & scoring",
      "Full interview history",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
];

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold text-white">Upgrade</h1>
        <p className="mt-2 text-slate-300">
          Get more practice and deeper feedback. Billing isn&apos;t wired up yet —
          this is a preview.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg border bg-slate-900 p-6 ${
              plan.highlighted
                ? "border-indigo-500 ring-1 ring-indigo-500"
                : "border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {plan.highlighted && (
                <Sparkles className="h-5 w-5 text-indigo-400" />
              )}
              <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
              {plan.price}
              <span className="text-base font-normal text-slate-400">/mo</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={!plan.highlighted}
              className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                plan.highlighted
                  ? "bg-[#4845D2] text-white hover:bg-[#3f3cbf]"
                  : "cursor-not-allowed bg-slate-800 text-slate-500"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
