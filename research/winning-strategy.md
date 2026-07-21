# Before You Approve: competition strategy

Research snapshot: **2026-07-22 KST**. This document records why the project changed direction and which claims the submission can support.

## The decision

The project is entering the **Education** track as **Before You Approve**:

> A consequence-free simulator where learners practice supervising AI-agent tool calls by choosing Allow, Ask, or Block.

The original runtime-firewall concept was retired after competitive research found an existing product using the same IntentGate name and an unusually similar feature set: declared-intent matching, provenance, allow/hold/deny decisions, MCP interception, capability tokens, and hash-chained audit evidence. A cosmetic rename would not have solved the novelty problem. Source: [IntentGate](https://intentgate.app/).

The pivot preserves the strongest technical work, the MCP trace evaluator and literal-effect UI, but changes the user, outcome, and product loop:

1. A learner sees the original assignment and a literal `tools/call` action.
2. They commit to Allow, Ask, or Block.
3. The simulator reveals provenance, blast radius, reversibility, and a concrete counterfactual.
4. Scoring distinguishes unsafe approvals from unnecessary blocks.
5. Educators can derive reviewed practice cases from sanitized MCP-shaped traces.

This is an education product, not a production security boundary and not a claim to solve prompt injection.

## Why this problem is real

OpenAI's own guidance says users should carefully review confirmation details, and that broad instructions increase risk. It also explains that mature social-engineering attacks are not generally solved by a single AI-based classifier, which makes human judgment and layered capability constraints important. Sources: [Prompt injections](https://openai.com/safety/prompt-injections/) and [Designing agents to resist prompt injection](https://openai.com/index/designing-agents-to-resist-prompt-injection/).

Practitioners describe approval fatigue and rubber-stamping. They ask for literal payloads, affected people and data, reversibility, and blast radius instead of a persuasive agent summary. Sources: [human approval discussion](https://www.reddit.com/r/AI_Agents/comments/1upjbei/human_approval_is_too_vague_for_production_agents/) and [approval fatigue discussion](https://www.reddit.com/r/AI_Agents/comments/1uws7ct/anybody_else_struggling_with_constant_approvals/).

The learning case is broader than security training. The OECD/European Commission AI Literacy Framework emphasizes critical evaluation and informed decisions about AI risks, while UNESCO's student competency framework emphasizes human agency, accountability, safe use, and critical judgment. Sources: [OECD AI Literacy Framework](https://www.oecd.org/en/publications/empowering-learners-for-the-age-of-ai_65cd27d4-en.html) and [UNESCO AI competency framework for students](https://www.unesco.org/en/articles/ai-competency-framework-students).

## Winning loop

The memorable demonstration is deliberately small:

- A safe read should be **allowed**, proving the lesson is not "block everything."
- An external send introduced by an untrusted message should be **blocked**.
- An underspecified write should trigger **ask**, teaching calibrated intervention.
- A wrong approval produces a simulated, consequence-free reveal of what would have happened.
- The learner retries and sees the mastery signal change.

The product is closer to a flight simulator than a quiz: it uses realistic MCP-shaped actions, makes the learner commit before revealing the answer, and teaches through concrete counterfactual effects.

## Rubric map

The official rules weight all four criteria equally. Tie-breaking begins with Technological Implementation. Source: [OpenAI Build Week Official Rules](https://openai.devpost.com/rules).

| Criterion | Evidence in this repository |
| --- | --- |
| Technological Implementation | Responsive React/TypeScript drill state machine, deterministic scoring, strict scenario fixtures, MCP JSON-RPC trace recorder, persistent SHA-256 receipt verification, and focused tests. |
| Design | One coherent Observe -> Decide -> Explain -> Reflect loop, with desktop/mobile layouts and immediate consequence feedback. |
| Potential Impact | A specific learner and educator audience, a current supervision-literacy gap, and measurable prototype practice signals such as unsafe approvals and unnecessary blocks. |
| Quality of Idea | A consequence-free simulator for literal agent actions, rather than another prompt course, abstract ethics quiz, or runtime firewall. |

## OpenAI use

The event requires meaningful use of both Codex and GPT-5.6, but the organizers explicitly clarify that an OpenAI API integration is not required. GPT-5.6 was used through the primary Codex build thread to research the problem, compare pivots, structure and red-team the drill cases, implement the product, and verify the result. The runtime remains deterministic so the checked-in demo needs no API key or live credentials. Sources: [final organizer checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips) and [Tuesday clarification](https://openai.devpost.com/updates/45371-tuesday-last-minute-tips).

## Claim boundaries

- The product reports prototype **practice signals**, not validated learning gains.
- Cases are synthetic or sanitized; the simulator causes no real side effects.
- The trace recorder is a content and evidence pipeline, not a certified enforcement boundary.
- The project does not claim to detect or solve prompt injection.
- Any performance number must come from a checked-in, reproducible benchmark.
- The submission should contain no third-party logos, copyrighted music, or unlicensed media.
