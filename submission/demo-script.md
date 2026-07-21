# Demo Script - Target 2:40

Record the working product rather than a slide deck. Keep the final YouTube video below 3:00; this script targets 2:40 with cuts aligned to the measured narration paragraph starts.

## Recording preparation

- Use the final deployed build in a clean 16:9 browser window at readable zoom.
- Use only the checked-in synthetic cases and generic tool labels. Hide bookmarks, notifications, personal data, credentials, and unrelated windows.
- Prepare two inbox-drill takes: one with an unsafe Allow on the final action, and one correct run ending in Block.
- Prepare the Case library, `cases/GPT-5.6-AUTHORING.md`, one fixture, and `scripts/drill-schema.mjs` in readable views.
- Prepare terminal tabs for `npm run trace:demo`, `npm test`, and `npm run build` from the final commit.
- Rehearse every click against the deployed build. Remove any narration that is not visible or supported by the repository.
- Use clear English voiceover and accurate English captions. Silence behind the narration is safer than unlicensed music.

The checked-in `submission/video/record_demo.py` reproduces the final cut. It captures the real app and proof states as lossless 2560 x 1440 PNG scenes, waits for local fonts, and encodes those scenes directly with the narration at H.264 CRF 12. This avoids an upscaled, low-bitrate screen-recording intermediate. With the app running on port 4173:

```bash
python3 submission/video/record_demo.py
```

On macOS, the script can generate the ignored narration AIFF from `narration.txt` with the built-in Samantha voice when the audio file is absent. `ffmpeg` and Playwright are required for the recording workflow, but not for running the project.

## 0:00-0:14 - Cold open: the decision

**Screen:** Begin on the inbox case's final `mail.send` action. Keep the original no-send task, external destination, untrusted provenance, and Allow / Ask / Block controls visible.

**Voiceover:**

> An agent wants to send three support threads to an external address. The request came from text inside a message, and the user explicitly said not to send anything. Would you allow it, ask, or block it?

## 0:14-0:27 - The missing lesson

**Screen:** Cut to the product header and restart the inbox drill.

**Voiceover:**

> We teach people to prompt AI and check its answers, but not to supervise what an agent actually does. Before You Approve is a consequence-free practice simulator for students and educators.

## 0:27-0:40 - Allow proportionate work

**Screen:** On `mail.search`, point to the narrow read-only effect and trusted user-request provenance. Choose **Allow** and show the feedback.

**Voiceover:**

> This first call only finds the three messages the learner requested. Its scope is narrow, read-only, and directly authorized, so I allow it. The lesson does not reward blocking everything.

## 0:40-0:54 - Ask for missing authority

**Screen:** Cut to the restricted account lookup. Choose **Ask** and reveal the fixture explanation and counterfactual.

**Voiceover:**

> This lookup is not clearly malicious, but restricted account data was never requested or needed for the summary. Asking is the calibrated response. Feedback names what authorization would change the decision.

## 0:54-1:09 - Make the dangerous mistake safely

**Screen:** Cut to the final external send. Choose **Allow** once. Hold on the simulated consequence and the line **No real action ran**. Then cut to the correct take and choose **Block**.

**Voiceover:**

> Here I approve too quickly. The simulator reveals what would have happened: customer content would have left the workspace, but no real action ran. On replay, I trace the instruction back to untrusted message content and block it.

## 1:09-1:24 - Calibrated run signals

**Screen:** Show a completed drill card with score, unsafe allows, and unnecessary blocks. Briefly open Progress and keep its **Demonstration data** label visible.

**Voiceover:**

> The completion card calculates score, unsafe approvals, and unnecessary blocks from this run. The separate Progress screen is explicitly seeded demo data. These are practice signals, not claimed learning outcomes.

## 1:24-1:38 - Transfer the skill

**Screen:** Open Case library and select the purchase and repository cases.

**Voiceover:**

> The same skill transfers across three four-action cases: untrusted inbox instructions, an over-limit purchase, and destructive repository cleanup. Every case includes Allow, Ask, and Block.

## 1:38-2:04 - Technical proof

**Screen:** Run `npm run trace:demo`; point to the synthetic action, blocked evaluation, prior hash, and receipt hash. Cut to the passing proxy and schema tests.

**Voiceover:**

> The cases are grounded in agent mechanics. This dependency-free Node recorder derives an action from MCP-style JSON-RPC and writes SHA-256-linked receipts. Tests cover forwarding, review and block withholding, metadata removal, chain continuity, replay, and tamper rejection. It is an educational recorder, not a production security boundary.

## 2:04-2:30 - Codex and GPT-5.6

**Screen:** Show `cases/GPT-5.6-AUTHORING.md`, then a fixture's `authoredWith` and `teacherReviewRequired` fields, followed by the strict validator.

**Voiceover:**

> I used GPT-5.6 through Codex at build time to research the problem, challenge the first concept, author and adversarially review these three traces, and implement the interface, validator, recorder, and tests. The reusable prompt, authored fixtures, and teacher-review requirement are checked in. Grading is deterministic, and the demo needs no API key.

## 2:30-2:40 - Close

**Screen:** Return to the original task, literal tool call, and three decision buttons with the product name visible.

**Voiceover:**

> Teach prompts. Teach outputs. Now teach when AI may act. This is Before You Approve.

## Final edit checks

- Runtime stays below 3:00; the reproducible cut is exactly 2:40.
- The first working decision appears in the first 15 seconds.
- English narration is audible at normal volume and captions are accurate.
- The video says what was built, how Codex was used, and how GPT-5.6 materially contributed at build time.
- Every narrated capability is visible or directly supported by code and tests.
- The Progress screen remains labeled as demonstration data.
- No runtime OpenAI API, external attestation, production-security, measured-learning, or real-side-effect claim appears.
- No private data, credentials, unrelated brands, unresolved field markers, or unlicensed audio appears.
- The final YouTube URL plays without sign-in and permits embedding.
