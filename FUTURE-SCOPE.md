# Future Scope

Planned / considered features that are **not** in the codebase yet. Bug fixes live
in `TODO.md`; smaller improvements in `TODO2.md`.

---

## 1. Record video + audio of an interview

Give the user an **opt-in** option to record their mock interview (camera + mic)
so they can review their body language, pacing, and delivery afterwards.

### Decision: save the recording **locally**, not to the internet

The recording is written to the user's own computer (Downloads folder or a
folder they pick). Nothing is uploaded. This was chosen over cloud storage
because it needs **no storage service, no backend upload path, no database
change, no new dependencies**, and it removes almost all privacy/retention/legal
burden — the file only ever exists on the user's machine.

The cloud-storage approach is documented at the bottom for completeness, marked
as **not chosen**.

---

### 1A. Local-only implementation (the plan)

Everything here is a **browser built-in** — `MediaRecorder`, `Blob`,
`URL.createObjectURL` / the File System Access API. No npm packages, no env
vars, no server work.

#### Capture

- Get a stream with `navigator.mediaDevices.getUserMedia({ video: true, audio: true })`.
  - `react-webcam` already exposes this: `webcamRef.current.stream` — reuse it
    instead of opening a second stream.
  - **Re-enable audio on `<Webcam>`** — it is currently `audio={false}` (set that
    way to free the mic for speech-to-text). Video recording needs an audio
    track, so either flip it back when recording is on, or capture a separate
    audio-only stream and add its track.
- Create `const rec = new MediaRecorder(stream, { mimeType })`.
- **Codec / container** — feature-detect:
  - `MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')` — Chrome/Edge/Firefox
  - fall back to `'video/webm;codecs=vp8,opus'`
  - Safari: only `'video/mp4'`, and `MediaRecorder` support is partial/flaky —
    treat Safari as "recording not available" if `isTypeSupported` fails.
- `rec.ondataavailable = (e) => chunks.push(e.data)`.
- `rec.start(timeslice)` — pass a `timeslice` (e.g. `1000` ms) so chunks flush
  periodically instead of only at stop (protects against a tab crash).
- On stop: `const blob = new Blob(chunks, { type: rec.mimeType })`.

#### Scope: whole interview vs per-question

- **Whole interview (recommended):** start the recorder when the interview
  starts, keep it running across question navigation (the `RecordAnswerSection`
  component stays mounted, so this works), stop on "End Interview". One file.
- **Per-question:** one clip per question → multiple downloads, or client-side
  concatenation (extra complexity). Easier retries, messier output.

#### Save to disk — two methods, use both

1. **Simple / universal — `<a download>`**
   - `const url = URL.createObjectURL(blob)`
   - create `<a href={url} download="interview-<mockId>-<yyyy-mm-dd>.webm">`,
     click it programmatically, then `URL.revokeObjectURL(url)`.
   - Lands in the browser's Downloads folder. Works in every browser.
   - Downside: the entire video is held in memory as one Blob until saved
     (~100+ MB for a 20-min 720p recording).

2. **Better UX — File System Access API** (Chrome/Edge only)
   - `const handle = await window.showSaveFilePicker({ suggestedName, types: [...] })`
   - `const writable = await handle.createWritable()`
   - Write each `ondataavailable` chunk straight to `writable` as it arrives, then
     `writable.close()`. The full file never sits in RAM.
   - Detect support: `if ('showSaveFilePicker' in window)` → use this; else fall
     back to method 1.

#### UI

- An **opt-in toggle** near the webcam: "Record this session (saved to your
  computer)". Default **off**.
- A visible **recording indicator** (red dot / timer) while capturing.
- On stop, a toast: "Recording saved to <filename>" (or "…to your Downloads").
- **Update the copy** everywhere that currently says "We never record your
  video" (`NEXT_PUBLIC_INFORMATION` in `.env`, the info box on the interview
  setup page, `QuestionsSection` note). It should say recording is optional,
  off by default, and stays on the user's device.

#### Gotchas

- **Tab closed mid-recording** → recording lost. Mitigate with the `timeslice`
  flush + (for the FS Access path) incremental writes so a partial file survives.
- **`.webm` playback** — won't open in QuickTime; fine in VLC / any browser. Note
  this to the user. Client-side transcode to mp4 (ffmpeg.wasm) is heavy — skip.
- **Memory** — long recording as a single in-memory Blob is large; prefer the
  streaming writer for anything over a few minutes.
- **Mic contention** — speech-to-text (`react-hook-speech-to-text`) and the
  recorder both want the mic. Sharing one `getUserMedia` stream between the
  recorder and leaving Web Speech API to its own capture usually works, but test
  it; worst case, disable live transcript while recording and rely on the
  recorded audio.
- **Permissions** — needs mic permission in addition to camera (camera is
  already requested on the setup page).
- **Sandboxed/iframe contexts** block programmatic downloads — not an issue for
  the app's own pages.

#### Minimum to ship

`MediaRecorder` capture → assemble `Blob` → `<a download>` click, gated behind an
opt-in toggle, with the "we never record" copy updated. No infra.

#### Nice-to-haves (later)

- File System Access streaming writer (Chrome/Edge) for large recordings.
- In-app playback of the just-recorded blob before the user saves it
  (`<video src={objectURL} controls>`), with a "Save" / "Discard" choice.
- Per-question bookmarks / chapter marks in the recording.
- Remember the toggle state in `localStorage`.

---

### 1B. Cloud storage approach — NOT CHOSEN (kept for reference)

If recordings ever need to be viewable from another device or shared:

- **Capture:** same `MediaRecorder` flow as above.
- **Storage service (pick one):** Vercel Blob (`@vercel/blob`, has a client-upload
  helper that bypasses the 4.5 MB serverless body limit) · Cloudflare R2 / AWS S3
  (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, presigned URLs; R2 has
  cheap egress) · UploadThing (`uploadthing` + `@uploadthing/react`).
  **Not Neon/Postgres** — wrong tool for large binary.
- **Backend:** a server action / route handler that issues a **presigned upload
  URL** (client PUTs the blob directly — don't stream large files through the
  server); a matching action for presigned **read** URLs if the bucket is
  private; delete-the-blob logic wired into interview deletion.
- **Env (server-only):** `BLOB_READ_WRITE_TOKEN` (Vercel Blob) or
  `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_BUCKET` / `S3_REGION` (or R2
  equivalents).
- **Schema (`utils/schema.js` + `npm run db:push`):** add to `MockInterview` or a
  new `interviewRecording` table — `recordingUrl` / `recordingKey` (varchar),
  `recordingDurationSec`, `recordingSizeBytes`, `recordingCreatedAt`.
- **Playback:** `<video controls>` on the feedback page pointing at the stored
  (signed, if private) URL.
- **UX & legal:** opt-in toggle, recording indicator, updated copy, consent
  checkbox, a delete path, a stated retention period.
- **Cost:** storage + playback egress. ~50–150 MB per 10-min 720p interview. Needs
  a retention / cleanup policy.

---

_Added 2026-09-01._
