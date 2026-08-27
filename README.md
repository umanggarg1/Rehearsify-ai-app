# Rehearsify — AI Interview Mocker

An AI-powered mock-interview app. Tell it your target role, tech stack, and years
of experience; it generates a set of interview questions, lets you answer them out
loud on camera, transcribes your answers in real time, and returns a rating plus
specific, actionable feedback for each one — then a full performance breakdown at
the end.

Built with the Next.js App Router. All database and AI work runs in authenticated
**server actions**, so no credentials or direct data access ever reach the
browser.

---

## Main features

- **AI-generated question sets** — questions tailored to your job role, tech
  stack, and experience level (count configurable, default 5). The first question
  is always an intro/past-projects opener; the rest target the role.
- **Voice answers with a live transcript** — answer by speaking; the browser's
  Web Speech API transcribes as you go, and you can still edit the text before
  saving.
- **Webcam practice** — rehearse on camera to get used to the format. Video is
  previewed only, never recorded or uploaded.
- **Per-answer AI feedback** — every answer gets a 1–10 rating and 3–5 lines of
  improvement notes from Google Gemini.
- **Performance breakdown** — the feedback page shows an overall rating plus a
  collapsible per-question view: your answer, an ideal answer, and the feedback.
- **Dashboard & history** — total interviews, best score, and improvement rate,
  with a list of past interviews you can re-open or review.
- **Authentication** — email/password and social sign-in via Clerk; every route
  under `/dashboard` is protected by middleware.
- **Security by design** — DB writes and Gemini calls happen only in server
  actions that verify the Clerk session and check row ownership; the AI actions
  are rate-limited per user.

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, React 19), server actions |
| Language | JavaScript (JSX) |
| Auth | [Clerk](https://clerk.com) (`@clerk/nextjs`) + route-protection middleware |
| Database | [Neon](https://neon.tech) serverless Postgres |
| ORM / migrations | [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit` |
| AI | [Google Gemini](https://ai.google.dev) `gemini-2.5-flash` (`@google/generative-ai`) |
| Speech-to-text | `react-hook-speech-to-text` (browser Web Speech API) |
| Webcam | `react-webcam` |
| Styling | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) (Radix primitives), `lucide-react` icons |
| Notifications | `sonner` (toasts) |
| Dates | `moment` |
| Hosting | [Vercel](https://vercel.com) |

### Data model

- **`MockInterview`** — one row per generated interview: the job details, the
  generated Q&A JSON, `createdBy` (user email), `mockId` (UUID).
- **`userAnswer`** — one row per answered question: the question, your answer, the
  ideal answer, Gemini's `rating` and `feedback`, `userEmail`, `mockIdRef`
  (links back to `MockInterview.mockId`).

---

## How it works (user flow)

1. **Sign in / sign up** at `/sign-in` or `/sign-up`.
2. **Dashboard** (`/dashboard`) — see your stats and past interviews.
3. **New interview** — click **+ Add New Interview**, enter the job role, tech
   stack / description, and years of experience, then submit. Gemini generates the
   questions and you're routed to the interview.
4. **Setup** (`/dashboard/interview/<id>`) — review the details and enable your
   camera & microphone, then **Start Interview**.
5. **Answer** (`/dashboard/interview/<id>/start`) — for each question: click
   **Record Answer**, speak, click **Stop**, tidy the transcript if needed, then
   **Save Answer**. Gemini rates it and the app advances to the next question.
6. **Finish** — after the last question, click **End Interview**.
7. **Feedback** (`/dashboard/interview/<id>/feedback`) — overall rating plus a
   per-question breakdown (your answer / ideal answer / feedback). Re-openable
   later from the dashboard history.

---

## Architecture

### Overview

```mermaid
flowchart TB
    subgraph Browser["Browser (client)"]
        UI["React 19 client components<br/>dashboard, interview flow, auth UI"]
        Cam["react-webcam"]
        STT["Web Speech API<br/>(react-hook-speech-to-text)"]
    end

    subgraph Vercel["Next.js server (Vercel)"]
        MW["middleware.js<br/>Clerk route protection for /dashboard(*)"]
        RSC["Server Components<br/>(layouts, static pages)"]
        ACT["utils/actions.js — 'use server'<br/>auth() + ownership checks + rate limit"]
    end

    subgraph External["Managed services"]
        Clerk["Clerk<br/>sessions, users"]
        Neon[("Neon Postgres<br/>MockInterview, userAnswer")]
        Gemini["Google Gemini<br/>gemini-2.5-flash"]
    end

    UI -- "navigations / RSC requests" --> MW
    MW --> RSC
    MW <-- "verify session" --> Clerk
    UI -- "server action calls (RPC)" --> ACT
    ACT -- "auth()/currentUser()" --> Clerk
    ACT -- "SQL over HTTPS (server-only)" --> Neon
    ACT -- "generateContent (server-only)" --> Gemini
    Cam -. preview only .-> UI
    STT -. transcript .-> UI
```

### Layers

- **Client components** render the UI and handle interactive bits the browser
  owns — webcam preview, speech-to-text, form state, toasts. They hold **no
  secrets** and never talk to Neon or Gemini directly.
- **Middleware** (`middleware.js`) runs Clerk on every request and blocks
  unauthenticated access to `/dashboard(.*)`.
- **Server actions** (`utils/actions.js`, marked `"use server"`) are the only
  place data and AI logic live. Each action:
  1. `requireEmail()` — calls Clerk `auth()` / `currentUser()`, rejects if not
     signed in, and derives the user's email from the **session** (never from
     client input).
  2. For per-interview operations, `getOwnedInterview()` loads the row and
     verifies `createdBy === session email` before any read or write.
  3. For the Gemini-backed actions (`createInterview`, `saveAnswer`),
     `checkAiRateLimit()` caps usage per user (10/min, 60/hour).
- **`utils/db.js`** and **`utils/GeminiAIModel.js`** both `import "server-only"`,
  so an accidental import from a client component fails the build instead of
  leaking a credential.

### Trust boundary

Everything the browser receives is untrusted. Client code carries only a Clerk
session cookie — no `DATABASE_URL`, no `GEMINI_API_KEY`. Losing the JS bundle to
an attacker exposes UI code and nothing else. All authorization decisions
(is this user signed in? do they own this interview?) are made server-side.

### Request lifecycle — "create an interview"

1. `AddNewInterview` (client) collects the job details and calls the
   `createInterview` server action.
2. The action authenticates the caller, rate-limits, builds the Gemini prompt,
   and calls `gemini-2.5-flash`.
3. The JSON response is cleaned and parsed, then inserted into `MockInterview`
   with `createdBy` set to the session email.
4. The action returns `{ mockId }`; the client routes to
   `/dashboard/interview/<mockId>`.

### Request lifecycle — "save an answer"

1. `RecordAnswerSection` (client) sends the question + spoken answer to the
   `saveAnswer` action.
2. The action authenticates, confirms the interview belongs to the user,
   rate-limits, and asks Gemini for a rating + feedback.
3. The parsed result is inserted into `userAnswer` (linked by `mockIdRef`), and
   the client advances to the next question.
4. The feedback page later reads those rows back via `getFeedback` (ownership
   re-checked) to render the breakdown.

### Environment & configuration

| Variable | Scope | Used by |
|---|---|---|
| `DATABASE_URL` | server only | `utils/db.js`, `drizzle.config.js` |
| `GEMINI_API_KEY` | server only | `utils/GeminiAIModel.js` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | client + server | Clerk provider |
| `CLERK_SECRET_KEY` | server only | Clerk backend |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `..._SIGN_UP_URL` | client | Clerk routing |
| `NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT` | client + server | question-count in the prompt |

---

## Getting started

### Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (`AIza…`)

### 1. Install

```bash
git clone https://github.com/umanggarg1/Rehearsify-ai-app.git
cd Rehearsify-ai-app
npm install
```

### 2. Configure environment

Copy `.env.example` and fill in real values. Split them as follows:

`.env`

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Server-only — never prefixed with NEXT_PUBLIC_, never sent to the browser
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

`.env.local`

```bash
GEMINI_API_KEY=AIza...
NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT=10
```

> **Important:** `DATABASE_URL` and `GEMINI_API_KEY` must **not** carry the
> `NEXT_PUBLIC_` prefix — that would bundle them into client JavaScript. They are
> read only inside server actions.

### 3. Create the database schema

```bash
npm run db:push        # pushes the Drizzle schema to DATABASE_URL
npm run db:studio      # optional: open Drizzle Studio to inspect data
```

### 4. Run

```bash
npm run dev
```

Open **http://localhost:4000**.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server on port **4000** |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 4000 |
| `npm run lint` | `next lint` |
| `npm run db:push` | Apply the Drizzle schema to the database |
| `npm run db:studio` | Open Drizzle Studio |

---

## Project structure

```
app/
  (auth)/sign-in, sign-up        Clerk auth pages (custom dark UI)
  dashboard/
    page.jsx                     dashboard: stats + history
    how, questions, upgrade      info / placeholder pages
    interview/[interviewId]/
      page.jsx                   interview setup (camera check)
      start/                     answer flow (QuestionsSection, RecordAnswerSection)
      feedback/                  post-interview breakdown
    _components/                 Header, HeroSection, InterviewList, AddNewInterview, ...
  page.js                        landing page
  layout.js                      root layout (ClerkProvider, Header, Toaster)
utils/
  actions.js                     "use server" — all DB + Gemini logic, auth + rate limiting
  db.js                          Drizzle + Neon client (server-only)
  schema.js                      Drizzle table definitions
  GeminiAIModel.js               Gemini client + chat-session factory (server-only)
middleware.js                    Clerk route protection for /dashboard(.*)
drizzle.config.js                Drizzle Kit config
```

---

## Deployment (Vercel)

1. Import the repo into Vercel.
2. Add the environment variables from step 2 above in **Project → Settings →
   Environment Variables** — using the **non-prefixed** names `DATABASE_URL` and
   `GEMINI_API_KEY`.
3. Ensure `npm run db:push` has been run against the production database.
4. Deploy.

For production, also move Clerk from a development instance (`pk_test_…`) to a
production instance.

---

## Known limitations & roadmap

- Speech-to-text relies on the Web Speech API — reliable in Chrome, limited in
  Firefox/Safari (the answer textarea works as a manual fallback).
- Clerk is currently a development instance.
- `createdAt` is stored as a `DD-MM-YYYY` string, so time-of-day sorting and
  "improvement over time" analytics are approximate.

See [`TODO.md`](./TODO.md) (bug fixes) and [`TODO2.md`](./TODO2.md) (improvement
backlog) for the full list.
