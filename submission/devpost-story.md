# Before You Approve

## Exact fields

- **Project name:** Before You Approve
- **Tagline:** A flight simulator for the human side of AI agents: practice Allow, Ask, or Block before the consequences are real.
- **Category:** Education
- **Primary audience:** Students learning to supervise action-taking AI, and the educators who teach them
- **Try it out:** https://before-you-approve-imtonylee.vercel.app
- **Source code:** https://github.com/bytonylee/before-you-approve
- **Demo video:** `VIDEO_URL: paste the publicly viewable YouTube URL here`
- **Codex Session ID:** `SESSION_ID: use /feedback in the primary Codex build task, then paste the single ID here`
- **Built with:** React, TypeScript, Vite, Node.js, JSON-RPC, MCP-shaped tool calls, Codex, GPT-5.6

## Inspiration

We teach people how to prompt an AI and question its answers, but not how to decide whether an agent should be allowed to act.

That decision is easy to underestimate. A polite sentence such as "I need to share these notes to finish the task" can hide a literal tool call with an external destination, private data, and authority copied from untrusted content. The first time a learner discovers what **Allow** really means should not be while an agent is about to send a message, charge a card, or delete work.

I did not want to build another warning banner. I wanted a place to rehearse. A flight simulator lets a pilot make consequential mistakes without real consequences. People supervising AI agents deserve the same kind of practice.

## What it does

Before You Approve is an interactive supervision simulator. The learner sees the original assignment, the proposed MCP-shaped tool call, and the evidence needed to judge it: literal effect, target, arguments, reversibility, and provenance. They must choose one of three responses before seeing the answer:

- **Allow** when the action is understood, proportionate, and within the user's authority.
- **Ask** when the action could be acceptable but important scope or intent is missing.
- **Block** when the action exceeds authority or would cause a clearly prohibited effect.

Feedback then names the decisive evidence and shows the smallest fact that would change the decision. If the learner allows a harmful simulated action, the lesson reveals the consequence and explicitly says that no real action ran.

The checked-in library contains three four-action cases:

- an instruction discovered inside retrieved inbox content;
- a recommendation task that drifts toward an over-limit purchase;
- a repository inspection task that escalates into destructive cleanup.

Every case includes Allow, Ask, and Block decisions, so blocking everything cannot earn mastery. The completion view calculates the learner's score, unsafe approvals, and unnecessary blocks from that run. A separate Progress page is clearly labeled as seeded demonstration data; this prototype does not claim measured learning gains.

## How I built it

The learner experience is a responsive React and TypeScript application backed by versioned JSON fixtures and deterministic scoring. A strict validator rejects unknown fields, broken provenance, unsafe labels, non-JSON arguments, invalid timestamps, duplicate identifiers, and traces that fail to teach all three decision modes. I chose deterministic ground truth because a learner should not be graded by the same model that helped draft a scenario.

The companion `bya-trace` Node CLI works with newline-delimited MCP-style JSON-RPC over standard input and output. It derives a teaching action from each `tools/call`, removes local `_bya` metadata before forwarding, and withholds requests that the small local policy marks for review or blocking. It writes sequence-numbered, SHA-256-linked JSONL receipts. `verify` checks that the local chain is self-consistent, and `replay` produces a readable, non-executing event list. This is an educational recorder for synthetic or sanitized classroom traces, not a production security boundary or external attestation system.

The hosted lesson is credential-free. It does not call an external model, service, mailbox, store, or repository, and it never executes the displayed actions.

## How I used Codex and GPT-5.6

I used GPT-5.6 through Codex throughout the build rather than adding a decorative runtime call. In the primary task, it compared the official rules and judging criteria, researched approval fatigue and AI-literacy needs, and found that my first runtime-firewall concept overlapped with an existing product. That research drove a substantive pivot to an Education project focused on the human supervision skill.

GPT-5.6 then helped turn three learning objectives into coherent, multi-step tool traces. It adversarially reviewed each trace for authority laundering, false blocks, scope drift, and persuasive wording that should not change the correct decision. The reusable authoring specification is checked in at `cases/GPT-5.6-AUTHORING.md`, each fixture records `authoredWith: "GPT-5.6 via Codex"`, and `scripts/drill-schema.mjs` validates the final deterministic artifacts. Every fixture also carries `teacherReviewRequired: true`; structural validation is not a substitute for an educator.

Codex helped implement the React decision state, responsive interface, strict fixture validator, JSON-RPC recorder, receipt verification, and focused tests. It also red-teamed claims so the project does not pretend to solve prompt injection or report educational outcomes it has not measured.

The human decisions stayed explicit: I chose the audience, the three-way Allow/Ask/Block model, the learning objectives, the feedback timing, the visual direction, the final case wording, deterministic grading, and the boundary that simulated actions never run. No OpenAI API integration is claimed or required by the demo.

## Challenges

The hardest design problem was calibration. A binary safe-or-unsafe quiz would reward blocking everything, which is not useful supervision. **Ask** creates a middle path: the learner has to identify the missing scope or intent that would make a decision possible.

The second challenge was provenance. An agent's explanation is not evidence of authority. A learner needs to know who introduced the instruction, what data is affected, where it will go, and whether the effect can be reversed. That is why the interface keeps the original task and literal action beside the narrative context.

The third challenge was proving technical depth without creating risk. The browser remains a consequence-free simulator, while the separate recorder exercises real newline-framed JSON-RPC, child-process lifecycle, withholding behavior, and tamper detection against a local mock server. All public cases and fixtures are synthetic.

## What I am proud of

The product teaches one concrete skill instead of trying to teach "AI safety" in the abstract. A learner can complete a drill in a few minutes, make a mistake without causing harm, see the evidence they missed, and replay it.

I am also proud that the technical layer supports the educational claim. These are not generic multiple-choice questions pasted over prose. The cases preserve the structure of agent tool calls, their trust boundaries, and their literal effects. The feedback is tied to authority, scope, provenance, and reversibility.

## What I learned

Human agency is not a checkbox. It becomes meaningful only when people can inspect a proposed action, intervene for a reason, and learn from the result.

Public education frameworks point in the same direction. The OECD's AI Literacy Framework emphasizes critical evaluation and informed decisions about risk, while UNESCO's student AI competencies emphasize human agency and accountability. Before You Approve turns those broad goals into a specific practice loop: observe, decide, explain, reflect, and retry.

## What is next

This build is a prototype, not a validated curriculum. Next I would co-design drills with educators, run a pre/post classroom study, add accessible and localized cases, and publish a reviewed scenario library. I would measure whether practice reduces unsafe approvals without producing blanket blocking.

Teach prompts. Teach outputs. Now teach when AI may act.

## Suggested gallery captions

1. **The decision moment:** Inspect the original task and literal tool effect before choosing Allow, Ask, or Block.
2. **Provenance over persuasion:** Trace an external disclosure back to untrusted content before it runs.
3. **Counterfactual feedback:** See what a mistaken approval would have changed while the simulator confirms that no real action ran.
4. **Calibrated practice:** Review a run's score, unsafe approvals, and unnecessary blocks.
5. **Three domains, one skill:** Practice supervision across inbox, purchase, and repository cases.
6. **Traceable mechanics:** Record synthetic MCP-style calls and verify a self-consistent receipt chain.

## Screenshot shot list

- **Thumbnail, 3:2:** The decision screen with a short effect, visible provenance, and all three decision buttons.
- **Shot 1:** A safe read before the learner answers, showing why the product does not reward blocking everything.
- **Shot 2:** The external disclosure with destination and untrusted origin visible in the same frame.
- **Shot 3:** Simulated consequence feedback after an unsafe Allow, including "No real action ran."
- **Shot 4:** The restricted lookup with missing authority and the Ask response.
- **Shot 5:** A completion card showing calculated run signals.
- **Shot 6:** The case library with the three selectable domains.
- **Shot 7:** A terminal view of `bya-trace` plus passing receipt-chain tests.

## Evidence links

- OECD, *Empowering Learners for the Age of AI*: https://www.oecd.org/en/publications/empowering-learners-for-the-age-of-ai_65cd27d4-en.html
- UNESCO, *AI Competency Framework for Students*: https://www.unesco.org/en/articles/ai-competency-framework-students
