import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Bot, Sparkles, Mic, MessageSquareText } from "lucide-react";

const POINTS = [
  { icon: Sparkles, text: "5 questions tailored to your role and experience" },
  { icon: Mic, text: "Answer by voice with a live transcript" },
  { icon: MessageSquareText, text: "Instant AI rating and improvement notes" },
];

export default function Page() {
  return (
    <section className="bg-slate-800">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        {/* Left: brand panel */}
        <aside className="relative hidden overflow-hidden bg-slate-900 lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:col-span-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 -z-0 h-96 w-96 rounded-full bg-gradient-to-tr from-[#4845D2] to-[#8b5cf6] opacity-30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-16 -z-0 h-96 w-96 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#4845D2] opacity-25 blur-3xl"
          />

          <Link
            href="/"
            className="relative z-10 inline-flex items-center gap-2 text-white"
          >
            <Bot className="h-7 w-7 text-indigo-400" />
            <span className="text-lg font-semibold">AI Interview Mocker</span>
          </Link>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white xl:text-4xl">
              Your first mock interview is a minute away.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Create a free account and start practicing with AI-driven mock
              interviews — real questions, honest feedback.
            </p>

            <ul className="mt-8 space-y-4">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-slate-200">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-6">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} AI Interview Mocker
          </p>
        </aside>

        {/* Right: sign-up */}
        <main className="flex items-center justify-center px-6 py-12 sm:px-12 lg:col-span-7 lg:px-16 xl:col-span-6">
          <div className="w-full max-w-md">
            {/* Mobile brand header */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white"
              >
                <Bot className="h-6 w-6 text-indigo-400" />
                <span className="text-base font-semibold">
                  AI Interview Mocker
                </span>
              </Link>
              <h1 className="mt-4 text-2xl font-bold text-white">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Set up in under a minute and start practicing.
              </p>
            </div>

            <SignUp
              appearance={{
                layout: {
                  socialButtonsVariant: "blockButton",
                },
                variables: {
                  colorPrimary: "#4845D2",
                  colorBackground: "#0f172a",
                  colorText: "#f1f5f9",
                  colorTextSecondary: "#94a3b8",
                  colorInputBackground: "#020617",
                  colorInputText: "#f1f5f9",
                  borderRadius: "0.5rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "w-full bg-slate-900 border border-slate-700 shadow-xl",
                  headerTitle: "text-white",
                  headerSubtitle: "text-slate-400",
                  socialButtons: "gap-2",
                  socialButtonsBlockButton: {
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                    color: "#e2e8f0",
                  },
                  socialButtonsBlockButtonText: {
                    color: "#e2e8f0",
                    fontWeight: 500,
                  },
                  socialButtonsIconButton: {
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                  },
                  socialButtonsProviderIcon: { opacity: 1 },
                  socialButtonsProviderIcon__github: {
                    filter: "brightness(0) invert(1)",
                  },
                  socialButtonsProviderIcon__apple: {
                    filter: "brightness(0) invert(1)",
                  },
                  dividerLine: "bg-slate-700",
                  dividerText: "text-slate-500",
                  formFieldLabel: "text-slate-300",
                  formFieldInput:
                    "bg-slate-950 border-slate-700 text-white focus:border-indigo-500",
                  formButtonPrimary: "bg-[#4845D2] hover:bg-[#3f3cbf] text-white",
                  footerActionText: "text-slate-400",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300",
                  identityPreviewText: "text-slate-300",
                  identityPreviewEditButton: "text-indigo-400",
                },
              }}
            />
          </div>
        </main>
      </div>
    </section>
  );
}
