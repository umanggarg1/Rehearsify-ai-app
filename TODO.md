# TODO — Bug Fixes

Priority order. Check off as completed. Details for each item are in `ISSUES.md`.

## P1 — Broken / stuck states

- [x] **T1 (A-1)** `RecordAnswerSection.jsx` — wrapped `UpdateUserAnswer` in try/catch with `finally { setLoading(false) }` + error toast; hardened JSON cleanup (strip all fences, trim, regex-extract `{...}`, throw if none).
- [x] **T2 (A-2)** `feedback/page.jsx` — wrapped `GetFeedback` in try/catch with `finally { setLoading(false) }` + error toast.
- [x] **T3 (A-4)** `InterviewItemCard.jsx` — added leading `/` to the feedback route.
- [x] **T4 (A-3)** `start/page.jsx` + `interview/[interviewId]/page.jsx` — added `notFound` state + a proper "Interview not found" UI with a Back to Dashboard button; guarded `result[0]`.
- [x] **T5 (A-5)** `RecordAnswerSection.jsx` — calls `onAnswerSave()` after a successful save, so the interview auto-advances.

## P2 — Wrong data

- [x] **T6 (B-2 / C-1)** `dashboard/page.jsx` + `api/fetchUserData/route.js` — use `mockIdRef` (not `mockId`); Total Interviews now counts distinct interviews correctly. Also NaN-guarded rating sums and bestScore.
- [x] **T7 (C-2)** `dashboard/page.jsx` — `calculateImprovementRate` returns 0 when lowest score `<= 0` or fewer than 2 valid scores; filters NaN.
- [x] **T8 (C-3)** `feedback/page.jsx` — per-question rating now uses `getRatingColor(item.rating)`.
- [x] **T9 (C-4)** `feedback/page.jsx` — added `formatRating()` (parseFloat then `/10`, `N/A` when non-numeric); no more `8/10/10`.

## P3 — Wrong / noisy popups

- [x] **T10 (B-1)** `RecordAnswerSection.jsx` — reworded stop-recording toast to "Didn't catch that — please record your answer again."; removed the stray `setLoading(false)`.
- [x] **T11 (B-3)** `dashboard/page.jsx` — removed the `toast.success("Loaded N interview(s)")` background-refetch toast.
- [x] **T12 (B-4)** `QuestionsSection.jsx` — `alert()` → `toast.error(...)`.
- [x] **T13 (B-5)** `feedback/page.jsx` — "Congratulations!" header only shows when `feedbackList.length > 0`; otherwise a neutral "No feedback yet" header.

## P4 — Cleanup

- [x] **T14 (D)** Removed leftover debug `console.log`s (`QuestionsSection.jsx`, `feedback/page.jsx`, `RecordAnswerSection.jsx`).
- [x] **T15 (D)** `InterviewList.jsx` — renamed shadowed state var to `interviews`, removed the misleading `console.log`, wrapped fetch in try/catch, added a comment on why it refetches.
- [x] **T16 (D)** Copy typos fixed: "Experiance" → "Years of Experience", "comapre" → "compare".
- [x] **T17 (D)** `next.config.mjs` — added `outputFileTracingRoot: path.resolve()`.
- [x] **T18 (D)** `RecordAnswerSection.jsx` — now `model.startChat({ history: [] })` fresh per feedback call instead of the shared `chatSession` singleton.
- [ ] **T19 (D, optional)** Add ESLint (`eslint` + `eslint-config-next`, flat `eslint.config.mjs`). — NOT DONE

## P0 — Secrets in the client bundle (biggest issue)

- [x] **S1** Renamed env vars: `NEXT_PUBLIC_DRIZZLE_DB_URL` → `DATABASE_URL`, `NEXT_PUBLIC_GEMINI_API_KEY` → `GEMINI_API_KEY`. Updated `.env`, `.env.local`, `drizzle.config.js`; added `.env.example`.
- [x] **S2** `utils/db.js` + `utils/GeminiAIModel.js` now `import "server-only"` (accidental client import = build error). GeminiAIModel no longer `"use client"`; exports `newChatSession()` instead of a shared `chatSession`.
- [x] **S3** New `utils/actions.js` (`"use server"`) with `createInterview`, `getInterview`, `saveAnswer`, `getFeedback`, `getUserAnswers`, `getInterviewList`. Each calls Clerk `auth()`/`currentUser()`, derives the email server-side, and checks interview ownership (`createdBy === email`) before any read/write.
- [x] **S4** Rewired every client component (`AddNewInterview`, `interview/[id]/page`, `start/page`, `RecordAnswerSection`, `feedback/page`, `dashboard/page`, `InterviewList`) to call the actions — no more `db.*` or Gemini in the browser.
- [x] **S5** Deleted `app/api/fetchUserData/route.js` (unauthenticated; replaced by `getUserAnswers`).
- [x] Verified: `grep .next/static` finds no `postgresql://` / `neondb_owner` / `AIza…`. Build passes (9/9 pages).
- [ ] **S6 — YOU MUST DO THIS:** in the hosting dashboard (Vercel/etc.), rename the same two env vars, then **rotate both credentials** (Neon password + Gemini key) — the old values were public in every prior deployed build.

## T20 (now folded into S3/S5)
Old `api/fetchUserData` deleted; its job is done by the authenticated `getUserAnswers` action.

## Progress log

- 2026-08-27: T1–T18 applied; `next build` clean.
- 2026-08-27: S1–S5 applied — DB/AI moved to authenticated server actions, secrets out of the
  client bundle (verified via grep of `.next/static`). Build passes 9/9. Dev server up.
  Outstanding: S6 (rotate creds + update host env), T19 (ESLint).
  Not fixed: `[[...sign-uo]]` folder typo, `middleware.js` `/forum` matcher.
  Interview-flow + server-action paths verified by build only — not exercised end-to-end
  (need login + mic + live Gemini).
