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
- [ ] **T20 (security, optional)** `api/fetchUserData/route.js` — gate with Clerk `auth()` and use the session's email instead of trusting the request body. — NOT DONE (changes API contract; needs your call)

## Progress log

- 2026-08-27: T1–T18 applied. `next build` passes clean (10/10 pages). Dev server verified up.
  Still open: T19 (ESLint), T20 (API auth). Not fixed: `[[...sign-uo]]` folder typo (cosmetic, works), `middleware.js` `/forum` matcher (harmless).
  Interview-flow fixes (T1, T2, T4, T5, T8–T13) are verified by build only — not exercised end-to-end (need login + mic + live Gemini).
