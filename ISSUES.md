# Project Issues — Test Report

_Generated 2026-08-27. Based on `next build`, API route testing, dev-server log review, and full static analysis of every screen and every `toast` / `alert` call. Authenticated interview-flow items are from code analysis (not driven interactively)._

## Build & infra

| Check | Result |
|---|---|
| `next build` | PASS — 10/10 pages (after clean `.next`) |
| ESLint | NOT CONFIGURED — no lint gate exists |
| `POST /api/fetchUserData` | 200, but **no auth check** — any caller can POST any email and read that user's answers |
| Dev server | OK on :4000, no runtime errors in logs |
| Env vars | All present (`CLERK_*`, `NEXT_PUBLIC_DRIZZLE_DB_URL`, `NEXT_PUBLIC_GEMINI_API_KEY`, `NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT`) |

---

## A. Failures (crashes / stuck states)

### A-1. "Save Answer" can hang the whole screen forever, with no popup
`app/dashboard/interview/[interviewId]/start/_components/RecordAnswerSection.jsx` (`UpdateUserAnswer`, ~L70-126).
No try/catch. Sets `setLoading(true)` (full-screen `z-[9999]` overlay), then calls `chatSession.sendMessage()` and `JSON.parse(mockJsonResp)`. If Gemini errors (quota / safety / network) or returns text the cleanup regex doesn't fully strip, the function throws and `setLoading(false)` never runs → overlay stays up permanently, no error toast, user trapped.
Cleanup `.replace("```json","").replace("```","")` is brittle and leaves invalid JSON for many real responses.

### A-2. Feedback page can get stuck on the spinner, with no popup
`app/dashboard/interview/[interviewId]/feedback/page.jsx` (`GetFeedback`, L35-59).
No try/catch. Any DB error → `setLoading(false)` never runs → infinite "Loading your interview feedback…", no toast.

### A-3. Non-existent interview ID → infinite loader
- `start/page.jsx:31` — `JSON.parse(result[0].jsonMockResp)` throws `TypeError` when `result` is empty; caught but only `console.error`'d, then renders "No interview questions found." (misleading — the interview doesn't exist).
- `interview/[interviewId]/page.jsx:60-66` — not-found path fires `toast.error("Interview details not found")` but leaves `interviewData` undefined → skeleton loader forever. No not-found UI.

### A-4. "Feedback" button on dashboard history cards uses a bad path
`app/dashboard/_components/InterviewItemCard.jsx:14` — `router.push('dashboard/interview/'+id+'/feedback')` is missing the leading `/` (the `onStart` handler one line above has it). Relative push resolves wrong from `/dashboard` → 404 / double segment.

### A-5. Auto-advance after saving an answer doesn't work
`start/page.jsx:81-86` passes `onAnswerSave={handleAnswerSave}`, but `RecordAnswerSection.jsx` never calls `onAnswerSave`. Dead prop — user must manually hit "Next Question" after saving.

---

## B. Wrong / misleading popups

### B-1. "Error while saving your answer, please record again" — on Stop, nothing was being saved
`RecordAnswerSection.jsx:54-61` — fires inside `StartStopRecording` (the Record/Stop toggle) when you stop recording with < 5 chars transcribed. Saving is a different button. Also calls `setLoading(false)` for a `loading` that was never true. Reword to e.g. "Didn't catch that — try recording again."

### B-2. "Loaded 1 interview(s)" — always says 1, regardless of count
`app/dashboard/page.jsx:64-117` — destructures `const { mockId, rating } = item;` but rows from `/api/fetchUserData` are Drizzle `UserAnswer` rows whose field is `mockIdRef`, not `mockId` (`utils/schema.js:16`). `item.mockId` is `undefined` for every row → `reduce` collapses into one bucket → `averageRatings.length` is always 1 → toast says "Loaded 1 interview(s)" after any number of interviews.

### B-3. Success toast on every dashboard visit / silent refetch
`dashboard/page.jsx:116-118` + `useEffect(..., [user])` — Clerk's `user` identity changes on refreshes, re-running `fetchInterviews`, so `toast.success("Loaded N interview(s)")` pops on every mount/refresh. A background load shouldn't announce itself.

### B-4. Native `alert()` instead of a toast
`QuestionsSection.jsx:14` — `alert("Sorry, your browser does not support text to speech")`. Every other message in the app is a sonner toast.

### B-5. "Congratulations!" even with zero answers
`feedback/page.jsx:85-98` — hitting "End Interview" without answering still shows the big green "Congratulations!" header directly above "No interview feedback available."

---

## C. Wrong data shown

### C-1. "Total Interviews" stat is always 0 or 1
Same `mockIdRef` / `mockId` bug as B-2. `dashboard/page.jsx:83-90`.

### C-2. "Improvement Rate" can render `Infinity%`
`dashboard/page.jsx:125-135` — `((max - min) / min) * 100` with `min` = 0 when any answer is rated `"0"`. Also `.sort()`s the ratings, so it is not chronological "improvement" — just normalized range.

### C-3. Per-question rating always shown in red
`feedback/page.jsx:143` hard-codes `text-red-500`; `getRatingColor()` is only applied to the overall average. A 9/10 answer looks like a failure.

### C-4. Possible `"8/10/10"`
`feedback/page.jsx:144` appends `/10` to `item.rating`; if Gemini returned `"8/10"` you get `8/10/10`.

### C-5. `/api/fetchUserData` `uniqueMockIdCount`
`app/api/fetchUserData/route.js:15` maps `item.mockId` (also undefined). Currently harmless (`Set([undefined]).size` is 1 when rows exist) but misleading and fragile.

---

## D. Minor / cosmetic

- `InterviewList.jsx:9-12` — component and state variable both named `InterviewList`; ignores the `interviews` prop dashboard passes and re-queries the DB itself (redundant fetch). `console.log` logs the function, not the result.
- Debug `console.log` left in prod paths: `QuestionsSection.jsx:6`, `feedback/page.jsx:42`, `RecordAnswerSection.jsx:71-104`.
- `chatSession` is a module-level singleton (`utils/GeminiAIModel.js:44`) — every answer across every interview in a browser session shares one growing chat history; feedback quality degrades, token usage climbs.
- Sign-up route folder misspelled `[[...sign-uo]]` — works, ugly param.
- Copy typos: "Experiance" (`InterviewItemCard.jsx:21`), "comapre" (`QuestionsSection.jsx:36`).
- `middleware.js` protects `/forum(.*)` — no forum exists.
- `next.config.mjs` — set `outputFileTracingRoot` to silence the multiple-lockfiles workspace-root warning.
