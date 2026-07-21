# OpenAI Build Week Submission Checklist

## Deadline

- **Hard deadline:** July 21, 2026 at 5:00 PM PDT, which is July 22, 2026 at 9:00 AM KST.
- **Internal target:** Finish uploads and submit by 6:00 AM KST to preserve a three-hour buffer.
- Ordinary submission changes are not permitted after the deadline. Submit early and edit only while the submission period remains open.

## Immediate manual actions

- [ ] Join the hackathon with the account that will submit.
- [ ] Create the Devpost submission immediately, even while the four manual link fields are pending.
- [ ] Add every team member and confirm each invitation is accepted before the deadline.
- [ ] Select exactly one category: **Education**.
- [ ] Enter the exact project name: **Before You Approve**.
- [ ] Enter the tagline: **A flight simulator for the human side of AI agents: practice Allow, Ask, or Block before the consequences are real.**
- [ ] Paste the final story from `submission/devpost-story.md` and give it one natural-voice edit.
- [ ] Use only verified Built With tags: React, TypeScript, Vite, Node.js, JSON-RPC, MCP, Codex, and GPT-5.6.
- [ ] Add a public, free judge testing link with no unnecessary login.
- [ ] Add short testing instructions: open Practice, complete the four-action inbox drill, switch cases in Case library, and use Replay to reset.

## Product proof

- [ ] `npm run lint` passes from the final commit.
- [ ] `npm test` passes from the final commit.
- [ ] `npm run build` passes from the final commit.
- [ ] `npm run trace:demo` prints the synthetic action, blocked evaluation, and receipt without an error.
- [ ] The public demo loads in a clean incognito window on desktop and mobile.
- [ ] The app has no runtime console errors or failed asset requests.
- [ ] Each of the three cases can be selected and completed without stale state.
- [ ] Every checked-in case has exactly four actions and contains Allow, Ask, and Block ground truth.
- [ ] The inbox safe search produces Allow feedback.
- [ ] The restricted account lookup produces Ask feedback.
- [ ] The untrusted external send produces Block feedback.
- [ ] An unsafe Allow on the harmful send reveals the simulated consequence and states that no real action ran.
- [ ] Literal effect, target, arguments, reversibility, and provenance fit on screen without overlap.
- [ ] Completion signals are calculated from the current run.
- [ ] The separate Progress page remains visibly labeled as seeded demonstration data.
- [ ] No unmeasured speed, accuracy, learning-gain, or safety-improvement claim remains.
- [ ] No previous product name, provider logo, private address, credential, or real personal data appears in the UI, fixtures, screenshots, or video.
- [ ] The hosted learner path needs no OpenAI API key and makes no runtime model claim.
- [ ] Each fixture preserves `authoredWith: "GPT-5.6 via Codex"` and `teacherReviewRequired: true`.
- [ ] The build-time authoring specification and deterministic validator paths shown in the story exist in the final repository.
- [ ] The trace recorder uses only synthetic or operator-sanitized input.
- [ ] The record, verify, replay, tamper-rejection, and child-lifecycle behaviors pass their focused tests.
- [ ] Receipt verification is described only as local self-consistency with no external anchor.

## Repository

- [ ] Push the final code and confirm the judge can see the final commit.
- [ ] Keep the MIT license if the repository is public.
- [ ] If the repository is private, share it before the deadline with **testing@devpost.com** and **build-week-event@openai.com**.
- [ ] README includes requirements, install, run, build, lint, test, trace-demo, sample-data, and judge testing instructions.
- [ ] README states Node.js 22 or newer.
- [ ] README makes students and educators the primary audience and explains the consequence-free learning loop.
- [ ] README truthfully describes GPT-5.6 as a material build-time contributor through Codex, with no OpenAI API integration claimed.
- [ ] README links the reusable GPT-5.6 authoring specification, versioned fixtures, schema validator, and teacher-review boundary.
- [ ] README explains where Codex accelerated research, implementation, red-teaming, and testing, and where the builder made product and design decisions.
- [ ] README states that `bya-trace` is an educational recorder, not a production security boundary.
- [ ] README states that practice scores are prototype signals rather than validated learning outcomes.
- [ ] No `.env`, API key, personal data, real receipt payload, build output, or local deployment metadata is committed.
- [ ] Dated commit history shows the project work during the submission period.

## One Codex Session ID

- [ ] Open the official Codex interface on the **primary task where the majority of core functionality was built**.
- [ ] Type `/` in the Codex message box and select **`/feedback` from the pop-up command menu**. Do not send `/feedback` as ordinary chat text.
- [ ] Copy the unique Session ID displayed by Codex.
- [ ] Paste exactly one ID into the Devpost field.
- [ ] Do not paste logs into the field. Supporting Codex tasks can be described in the README.
- [ ] Note that an older FAQ mentions `/status`, but the organizer's newer forum instruction explicitly says to use the `/feedback` system command.

## Demo video

- [ ] Follow `submission/demo-script.md` and show the working product, not a marketing deck.
- [ ] Keep the final runtime **below 3:00**; target approximately 2:45.
- [ ] Include clear English audio covering what was built, how Codex was used, and how GPT-5.6 materially contributed at build time.
- [ ] Show a complete decision-to-feedback loop in the first minute.
- [ ] Show all three calibrated decisions: Allow, Ask, and Block.
- [ ] Show one unsafe Allow producing a simulated consequence and the explicit no-real-action boundary.
- [ ] Show the current-run completion signals and the seeded-data label on Progress.
- [ ] Show the three selectable case domains.
- [ ] Show technical proof: `npm run trace:demo`, passing focused tests, the checked-in GPT-5.6 authoring specification, a fixture's authorship metadata, and the validator.
- [ ] Do not imply that GPT-5.6 runs in the learner experience or that an OpenAI API key is required.
- [ ] Use only synthetic data and generic tool/provider labels.
- [ ] Use no copyrighted music or third-party trademarks without permission. Silence behind the voiceover is safest.
- [ ] Upload to YouTube early. Public or organizer-approved Unlisted visibility is acceptable, but the video must be viewable without signing in.
- [ ] Test the final URL in an incognito window and confirm embedding is allowed.
- [ ] Add accurate English captions.
- [ ] Paste the final URL into Devpost and play it once from the submission preview.

## Images

- [ ] Create a 3:2 thumbnail, preferably 1200 x 800, within Devpost's file-size limit.
- [ ] Make the product name and Allow / Ask / Block decision recognizable at thumbnail size.
- [ ] Capture the shot list in `submission/devpost-story.md` from the final deployed build.
- [ ] Include one screenshot of the no-real-action consequence boundary.
- [ ] Include one terminal screenshot only if receipt hashes and test output remain readable.
- [ ] Crop browser chrome, personal tabs, notifications, and desktop clutter.
- [ ] Add concise captions that point to visible evidence rather than repeating feature claims.

## Exact submission fields

- [ ] **Project name:** Before You Approve
- [ ] **Tagline:** A flight simulator for the human side of AI agents: practice Allow, Ask, or Block before the consequences are real.
- [ ] **Category:** Education
- [ ] **Project story:** final human-edited copy
- [ ] **Built With:** React, TypeScript, Vite, Node.js, JSON-RPC, MCP, Codex, GPT-5.6
- [x] **Try It Out:** https://before-you-approve-imtonylee.vercel.app
- [x] **Repository:** https://github.com/bytonylee/before-you-approve
- [ ] **Video:** `VIDEO_URL: manually paste the public or Unlisted YouTube URL`
- [ ] **Codex /feedback Session ID:** `SESSION_ID: manually generate in the primary build task and paste exactly one ID`
- [ ] **Testing instructions:** no-login path, case selection, expected four-action flow, Replay reset, and synthetic-data statement
- [ ] **Team:** all members accepted
- [ ] **Terms:** required checkbox accepted by the authorized representative

## Final 20-minute audit

- [ ] Search the repository and submission for unresolved proof markers, the previous product name, provider-specific demo names, fake metrics, and secrets. The four manual submission fields above are the only expected placeholders.
- [ ] Compare the video, story, README, live demo, and repository. They describe the same three cases, four actions per case, decision terms, and build-time GPT-5.6 role.
- [ ] Verify the demo, repository, and YouTube links without authentication.
- [ ] Confirm the deployed build corresponds to the final repository commit.
- [ ] Confirm the story never claims a Responses API call, Structured Outputs integration, runtime GPT-5.6 feature, immutable receipt, production security boundary, or validated learning gain.
- [ ] Submit the project. Saving a draft is not submission.
- [ ] Open **My Projects** and verify the entry has the green **Submitted** state, not **Draft**.
- [ ] Confirm the green submission notification appears.
- [ ] Take a timestamped screenshot of the Submitted state and final field values.
- [ ] Keep the demo and repository available through judging; safest is through the winner announcement around August 12, 2026.
- [ ] Do not change the competition submission, video, repository access, or team after the deadline unless the organizer explicitly permits it.

## Official references

- Rules: https://openai.devpost.com/rules
- FAQ: https://openai.devpost.com/details/faqs
- Organizer `/feedback` clarification: https://openai.devpost.com/forum_topics/44481-2-session-ids
- Devpost submission steps: https://help.devpost.com/article/126-know-your-submission-steps
