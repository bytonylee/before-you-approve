# SNS Pains and Trends for an OpenAI Hackathon Product

> **Pre-pivot research record:** This document captures the opportunity scan that led to the first concept. The recommended runtime-firewall product below was rejected after competitive review and is **not** the shipped project. See `research/winning-strategy.md` for the documented pivot to the Education prototype, Before You Approve.

Research snapshot: **2026-07-22 (Asia/Seoul)**
Primary window: **2026-04-23 to 2026-07-22** where sources were available; older 2025-2026 evidence is used for recurrence and baselines.

## Executive read

The strongest opportunity is not another general assistant. The social signal is moving from **"make AI do more"** to **"let AI act, but prove it stayed inside my intent."** Agent tool use is growing faster than the permission, provenance, and verification layers around it. This pain is current, technically specific, OpenAI-native, and unusually easy to demonstrate with a before/after attack scenario.

Three opportunities stand above the rest:

1. **IntentGate: a semantic action firewall for agents.** Intercept each consequential tool call, compare it with the user's stated intent, preview the effect in plain language, and issue a narrow, expiring capability only when it is safe.
2. **TrustCall: an independent-verification companion for scam calls.** Do not promise to detect synthetic audio. Detect scam tactics, pause the transaction, and verify the claimed identity through a trusted channel.
3. **ClearPath: a prior-authorization denial navigator.** Turn denial letters and medical evidence into a cited missing-evidence checklist and a human-reviewed appeal packet.

The best judging story is **trustworthy agency**, not more autonomous agency. A generic meeting summarizer, inbox assistant, AI code reviewer, or research chatbot enters a crowded field with weak differentiation.

## Method

- Searched Reddit, Hacker News, Product Hunt, GitHub issues/docs, LinkedIn posts, and first-party public reports.
- Prioritized first-person pain, recent recurrence, visible engagement, and a problem that can be shown in a 90-second live demo.
- Corroborated anecdotes with primary sources from the FTC, NIST, OWASP, HackerOne, KFF, AMA, Stack Overflow, Microsoft, OECD/government education sources, and current research papers.
- Engagement numbers are the values exposed by search/index pages at capture time, not a stable API snapshot.
- Product Hunt is used mainly as a saturation check. Launch copy is not treated as independent proof of a market claim.
- X and YouTube search results did not expose enough stable, auditable post-level engagement to support useful claims. LinkedIn results were usable only as a trend check, not as proof of prevalence.

## Ranked opportunities

Scores are 1-5. **Whitespace** is relative to the observed competitive scan, not a patent or exhaustive market search.

| Rank | Pain / opportunity | Evidence | Whitespace | OpenAI-native | Demo | Judge impact | Total / 25 | Main risk |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | Agent actions escape user intent; prompt injection and excessive agency | 5 | 4 | 5 | 5 | 5 | **24** | Security claims must be scoped; never imply perfect prevention |
| 2 | Imposter scams exploit urgency, secrecy, and trusted identities | 5 | 4 | 5 | 5 | 5 | **24** | Telephony integration and false reassurance |
| 3 | Prior-authorization denials are opaque and hard to appeal | 5 | 4 | 4 | 5 | 5 | **23** | Medical/privacy boundaries; clinician review required |
| 4 | AI-generated code moves the bottleneck to human verification | 5 | 2 | 5 | 5 | 4 | **21** | Very crowded code-review market |
| 5 | Special-education documentation competes with teaching time | 4 | 3 | 4 | 4 | 5 | **20** | FERPA/local rules and procurement friction |
| 6 | Real citations do not necessarily support the adjacent claim | 5 | 1 | 5 | 5 | 4 | **20** | 2026 market is already crowded with citation checkers |
| 7 | Neurodivergent people are overwhelmed by multi-step life admin | 4 | 2 | 5 | 4 | 4 | **19** | Broad scope becomes a generic assistant quickly |
| 8 | Meetings/inboxes create action-item and attention debt | 4 | 1 | 4 | 4 | 3 | **16** | Mature, saturated category with strong incumbents |

## Signal 1: agent permission and intent are the new bottleneck

### Social and developer evidence

- Hacker News' April 2025 discussion **"The 'S' in MCP Stands for Security"** reached **730 points and 183 comments**. The central technical concern was indirect prompt injection crossing boundaries between MCP servers and tools. The strongest proposed direction was contextual guardrailing, version-pinned tool definitions, and instruction namespacing. [HN thread](https://news.ycombinator.com/item?id=43600192)
- A later HN thread on a GitHub MCP exploit describes the practical failure mode: a malicious public issue can cause an agent with private-repository access to expose data. Commenters repeatedly converge on least privilege and treating the requesting user, not the LLM, as the principal. [HN thread](https://news.ycombinator.com/item?id=44097390)
- A 2026 HN discussion on AI code review contains the succinct demand: **"I'd trust AI more if it brought proof instead of speculation."** The broader thread says AI review has poor signal-to-noise and misses business context. [HN thread](https://news.ycombinator.com/item?id=46766961)
- A May 2026 Reddit security thread asks where containment should happen before agents can run shell commands, read files, or invoke MCP tools; it identifies over-permissioned MCP servers as a route across files, APIs, and databases. It had **5 votes** in a small specialist community. [Reddit, 2026-05-11](https://www.reddit.com/r/aisecurity/comments/1ta61s9/how_should_ai_coding_agents_be_contained_before/)
- A current LinkedIn cluster treats agent identity, least privilege, tool-call policy enforcement, audit evidence, prompt injection, and MCP supply chains as one category. Examples include an [OWASP MCP minimum-bar post](https://www.linkedin.com/posts/owasp-top-10-for-large-language-model-applications_owasp-genai-aisecurity-activity-7429564499898298368-gFoS), a [KYC document-injection incident discussion with 19 comments](https://www.linkedin.com/posts/lance-chua-458b1212a_ai-promptinjection-agenticsecurity-activity-7450027819235164160-A_BN), and [RSAC 2026 trend notes](https://www.linkedin.com/posts/mitchellashley_followme-rsac2026-agenticai-activity-7441874384333582336-j1D_).

### Primary corroboration

- NIST says many agents are vulnerable to **agent hijacking**, where malicious instructions embedded in data cause unintended harmful actions. [NIST, 2025-01-17](https://www.nist.gov/news-events/news/2025/01/technical-blog-strengthening-ai-agent-hijacking-evaluations)
- HackerOne's first-party 2025 report says AI-in-scope programs grew **270%** and prompt-injection reports rose **540%**. [HackerOne 2025 report](https://www.hackerone.com/report/hacker-powered-security)
- OWASP lists **excessive agency** as a top LLM application risk and uses a concrete example of a malicious incoming email causing an agent to scan an inbox and forward sensitive data. [OWASP LLM06:2025](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- GitHub's current Copilot documentation now explicitly says each additional tool consumes context and makes correct tool selection harder. This is direct product evidence that tool discovery itself needs mediation. [GitHub tool search docs](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/tool-search)
- A March 2026 Playwright MCP issue documents indirect injection arriving through a browser accessibility snapshot and cites the 2025 GitHub MCP breach. [GitHub issue #1479, opened 2026-03](https://github.com/microsoft/playwright-mcp/issues/1479)
- An April 2026 Hermes Agent issue reports that newly discovered MCP tools become callable with **no first-use approval** and requests approve-once/session semantics. [GitHub issue #16462, 2026-04-27](https://github.com/NousResearch/hermes-agent/issues/16462)
- OpenAI Codex issues show the other side of the same design problem: overly broad approval prompts can deadlock non-interactive runs, while bypassing them may also disable sandboxing. [Codex #15824](https://github.com/openai/codex/issues/15824), [Codex #24135](https://github.com/openai/codex/issues/24135)

### Competitive reality and gap

The category is forming quickly. DCP keeps credentials local and adds scopes/budgets/approvals; CtrlAI blocks unsafe calls through an HTTP proxy; Oktsec fronts MCP with policies; VS Code has tool approval and sandboxing. [DCP on Product Hunt](https://www.producthunt.com/products/dcp), [CtrlAI](https://www.producthunt.com/products/ctrlai), [Oktsec](https://github.com/oktsec/oktsec), [VS Code security docs](https://github.com/microsoft/vscode-docs/blob/main/docs/copilot/security.md)

The remaining product gap is not another static allowlist. It is **semantic intent continuity**:

- What did the user originally authorize?
- Which untrusted artifact introduced this sub-goal?
- What will change if this call succeeds?
- Can the system grant only the exact authority needed for this one effect?

That gap is highly demonstrable with an injected email/web page that attempts an unrelated transfer or data exfiltration.

## Signal 2: fraud defense should verify the request, not guess whether a voice is fake

### Social evidence

- A March 2026 IdentityTheft post on AI-assisted phone scams received **56 votes**. The practical advice was to refuse information on inbound calls, call back through a known number, add a bank passcode, and freeze credit. [Reddit, 2026-03-27](https://www.reddit.com/r/IdentityTheft/comments/1s5d35h/ai_voice_cloning_is_making_phone_scams_nearly/)
- In a February 2026 Scams thread, one commenter said their mother was scammed after answering an unknown call; another described a 90-year-old relative convinced by a fake grandchild emergency. The family-password advice received **32 votes**. [Reddit, 2026-02-28](https://www.reddit.com/r/Scams/comments/1rh1ku0/removed/)
- A June 2026 SaaS discussion makes the important product point: the threat is not only cloned audio; AI removes friction from personalized social engineering. The safest workflow remains hanging up and calling a known number. [Reddit, 2026-06-14](https://www.reddit.com/r/SaaS/comments/1u5tc5j/have_you_experienced_an_ai_voice_scam_or/)

### Primary corroboration

- The FTC received **more than 1 million imposter-scam reports in 2025**, with **$3.5B reported lost**, nearly triple 2020 losses. Imposter scams were about one in three fraud reports. [FTC, 2026-06-15](https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-data-show-people-reported-losing-3-point-5-billion-imposter-scams-2025)
- The FTC says scams originating on social media caused **$2.1B** in reported 2025 losses, and nearly 30% of people who reported losing money said the scam began there. [FTC, 2026-04](https://www.ftc.gov/news-events/news/press-releases/2026/04/new-ftc-data-show-people-have-lost-billions-social-media-scams)
- The FTC's own advice is behavioral and channel-based: do not move money in response to an unexpected call; independently contact the organization or person. [FTC older-adult spotlight, 2025-08](https://www.ftc.gov/system/files/ftc_gov/pdf/Imposter-Data-Spotlight-August-2025.pdf)

### Competitive reality and gap

Spam blockers and deepfake detectors already exist, but social evidence questions whether voice cloning is even necessary for many successful scams. A winning product should avoid the scientifically fragile promise **"we detect cloned voices."** The stronger gap is a calm, real-time **verification workflow** that catches urgency + secrecy + payment requests, then makes independent verification effortless.

## Signal 3: prior authorization is a measurable, emotionally legible administrative failure

### Social evidence

- A July 2026 HealthInsurance case describes a patient waiting on an authorization immediately before a flight and surgery; the author calls it **"exhausting."** A former insurance reviewer explains that denials often follow missing documentation or an unstated functional impact. The top answer received **22 votes**. [Reddit, 2026-07-12](https://www.reddit.com/r/HealthInsurance/comments/1uuttdc/chances_of_approval_after_prior_authorization/)
- In a specialist prior-authorization community, a recurring practical workaround is a payer-specific checklist so staff stop rereading changing policies. [Reddit thread, active through 2026-01-27](https://www.reddit.com/r/PriorAuthorization/comments/1p85gn8/what_are_the_biggest_pain_points_you_deal_with_in/)
- A May 2026 medicine discussion reports the recurring clinical claim that prior authorization delays care; the linked AMA figure says **93% of physicians** observed delays. [Reddit, 2026-05](https://www.reddit.com/r/medicine/comments/1t5pj9m/unitedhealthcare_to_remove_prior_authorization/)

### Primary corroboration

- KFF's January 2026 nationally representative poll found **32%** of insured adults call prior authorization a major burden and **34%** call it the single biggest navigation burden. Among people with ongoing chronic treatment, that rises to **39%**. [KFF, 2026-02-02](https://www.kff.org/public-opinion/poll-people-view-prior-authorization-as-greatest-burden-in-navigating-the-health-system/)
- KFF's 2024 marketplace data analysis, published in 2026, found fewer than **1% of denied claims were appealed**. [KFF, 2026](https://www.kff.org/patient-consumer-protections/claims-denials-and-appeals-in-aca-marketplace-plans-in-2024/)
- The AMA reports physicians complete about **39 prior authorizations per week** and **31%** say requests are often or always denied. [AMA, 2025-02-24](https://www.ama-assn.org/press-center/ama-press-releases/physicians-concerned-ai-increases-prior-authorization-denials)
- Current research found leading LLMs could generate strong clinical arguments but weak administrative scaffolding across 45 physician-validated synthetic cases. That is almost a direct product specification: focus on form requirements, evidence gaps, and workflow, not unsupervised medical judgment. [Preprint, 2026-03](https://arxiv.org/abs/2603.29366)

### Competitive reality and gap

Provider-side tools such as CoverMyMeds and Availity address submissions, but social discussions still ask whether they reduce burden or merely move it. The most hackathon-sized wedge is **patient/clinic appeal readiness**: upload the denial, plan criteria, and chart export; extract the exact reason; show missing evidence with source spans; produce a checklist and draft for clinician approval. Do not decide medical necessity.

## Signal 4: AI code creates a verification bottleneck

### Social evidence

- An ExperiencedDevs thread from May 2026 received **55 votes**. The author says a generated PR was hard to understand; replies describe unnecessary abstractions, inconsistent error handling, and hours of review. One respondent says the main limitation is now reading an **"absurd amount of code."** [Reddit, 2026-05-20](https://www.reddit.com/r/ExperiencedDevs/comments/1tifd5z/am_i_the_only_who_feels_this_way_abou_ai/)
- A June 2026 removed-but-indexed thread received **68 votes** for a comment describing engineers fixing outsourced AI output and **54 votes** for review exhaustion after four hours. [Reddit, 2026-06-13](https://www.reddit.com/r/ExperiencedDevs/comments/1u4ycwx/removed/)
- A code-quality thread received **58 votes** and says intent and system-level fit are hard to verify even when the code looks plausible. [Reddit, 2026-04-11](https://www.reddit.com/r/ExperiencedDevs/comments/1sibmbw/code_quality_in_the_ai_age/)
- HN's 2026 **"AI code review bubble"** discussion reports low signal-to-noise, contradictory nitpicks, missing business context, and a desire for property-based evidence rather than more prose. [HN](https://news.ycombinator.com/item?id=46766961)

### Primary corroboration

- Stack Overflow's 2025 survey found **46%** of developers distrust AI output accuracy versus **33%** who trust it; only **3%** highly trust it. At the same time, **84%** use or plan to use AI tools. [Stack Overflow 2025 survey](https://survey.stackoverflow.co/2025/ai)
- Google DORA's 2025 report provides the counterweight: **59%** reported a positive influence on code quality. The opportunity is therefore not anti-AI; it is to turn generated work into reviewable, test-backed evidence. [Google DORA summary](https://blog.google/innovation-and-ai/technology/developers-tools/dora-report-2025/)

### Competitive reality and gap

This is crowded: Product Hunt counted **139 code-review products** in July 2026. CodeRabbit, Graphite, Kilo Reviewer, Kodus, Bito, Baz, and new multi-agent reviewers all compete here. [Product Hunt category, 2026-07-21](https://www.producthunt.com/categories/code-review-tools)

The only defensible hackathon wedge is **proof-carrying changes**, not another reviewer:

- Map each changed behavior to the issue/acceptance criterion.
- Generate and run a minimal counterexample, property, or trace.
- Show a compact evidence bundle a human can reproduce.
- Abstain when the claim cannot be deterministically checked.

## Signal 5: special-education staff want documentation reduced, not teaching automated

### Social evidence

- A March 2026 special-education teacher says they must document the same notice in three places and that paperwork is making them physically ill. The post received **20 votes**; replies say it is impossible to finish paperwork and teach. [Reddit, 2026-03-26](https://www.reddit.com/r/specialed/comments/1s4nuqu/paperwork_burnout/)
- Another educator says one IEP takes **5-6 hours** and creates an expanding backlog; the post received **66 votes**. [Reddit, 2025-12-01](https://www.reddit.com/r/specialed/comments/1pb0dss/in_trouble_with_admin/)
- A February 2026 Teachers thread about mandated AI use received **1,440 votes**. The resistance is not to workload help; it is to districts using AI adoption as a reason to add requirements and caseload. [Reddit, 2026-02-18](https://www.reddit.com/r/Teachers/comments/1r7o19d/ai_demands/)

### Primary corroboration

- The OECD says experienced teachers report administrative work as a source of stress more often than novices in **38 of 54 education systems**. [OECD TALIS 2024 results, published 2025](https://www.oecd.org/en/publications/results-from-talis-2024_90df6235-en/full-report/the-demands-of-teaching_0e941e2f.html)
- A 2026 European School Education Platform survey found **79%** of respondents expect AI to reduce workload/administrative burden and support individual pupils, while training and data-use concerns remain. [European School Education Platform, 2026](https://school-education.ec.europa.eu/en/discover/surveys/survey-artificial-intelligence-teaching-and-learning)
- Ofsted's early-adopter research says leaders value AI most for lesson planning, resource creation, and administrative workload reduction. [GOV.UK/Ofsted, 2025-06-27](https://www.gov.uk/government/news/ai-in-education-how-schools-and-further-education-colleges-are-making-it-work)

### Product gap

Avoid an "AI writes the IEP" product. Build a **compliance-aware evidence ledger**: capture observations by voice, attach them to an existing goal, deduplicate them into required district fields, and show exactly which educator observation supports each statement. The teacher remains author and approver.

## Signal 6: citation existence is only half the trust problem

### Social evidence

- A May 2026 academia post about fabricated citations received **138 votes**. [Reddit, 2026-05-24](https://www.reddit.com/r/academia/comments/1tmgxe7/arxiv_is_banning_authors_with_ai_generated/)
- An April 2026 reviewer says a paper cited the reviewer and collaborator plausibly but fabricated the rest; the proposed minimum safeguard is reference validation before peer review. [Reddit, 2026-04-23](https://www.reddit.com/r/academia/comments/1stcnqs/i_just_reviewed_the_worst_ai_slop_and_its_making/)
- A June 2026 regulatory-affairs discussion identifies the harder failure: a real paper is cited for a conclusion it does not support. Manual claim-level verification remains the bottleneck. [Reddit, 2026-06](https://www.reddit.com/r/regulatoryaffairs/comments/1stfu2w/anyone_else_catching_ai_hallucinating_the_actual/)

### Primary corroboration

- A July 2026 paper found that roughly **one in twenty 2025 NeurIPS and USENIX Security papers** contained at least two likely hallucinated academic references under a strict definition. [Phantom References, 2026-07-01](https://arxiv.org/abs/2607.00738)
- arXiv now imposes a one-year ban on authors who submit AI-generated papers containing fabricated citations. [Nature report, 2026-05](https://www.nature.com/articles/d41586-026-01595-5)
- CiteAudit's 2026 benchmark explicitly decomposes checking into claim extraction, retrieval, passage matching, and calibrated judgment. [CiteAudit, 2026-02](https://arxiv.org/abs/2602.23452)

### Competitive reality

This category is already crowded in 2026: Microsoft's open-source [RefChecker](https://github.com/markrussinovich/refchecker), Paperpal, Veru, BibSafe, CiteClear, Citation.is, and several smaller checkers validate references or claim alignment. Product Hunt also shows Cito, Chirpz, and Bibby competing for academic search/writing. [Cito](https://www.producthunt.com/products/cito), [Chirpz](https://www.producthunt.com/products/chirpz-for-literature-discovery), [Bibby](https://www.producthunt.com/products/bibby-ai)

Use citation verification as a component inside another product, not the core hackathon pitch, unless the team has privileged publisher/reviewer access.

## Signal 7: life admin and attention debt are real but broad

### Social evidence

- A February 2026 ADHDWomen post received **37 votes**. The author says two routine errands caused a multi-day crash; a reply says, **"I just need someone to help me keep track of it all."** [Reddit, 2026-02-20](https://www.reddit.com/r/adhdwomen/comments/1ra5j4z/i_find_life_admin_exhausts_me_so_much_im_barely/)
- A January 2026 productivity thread says notifications create reaction mode; replies prefer intentional batches and true-emergency escalation. [Reddit, 2026-01-27](https://www.reddit.com/r/productivity/comments/1qokima/notifications_dont_make_me_productive_they_make/)
- A fresh July 2026 inbox thread describes archiving old messages unread because triage itself is too expensive. Engagement was low (**1 vote**) but the behavior recurs weekly in the same community. [Reddit, 2026-07-07](https://www.reddit.com/r/Productivitycafe/comments/1uprq7a/communication_clinic_share_your_best_inbox_zero/)

### Primary corroboration and saturation

- Microsoft 365 telemetry found high-volume users received **275 pings per day** and were interrupted about every two minutes; 60% of meetings were unscheduled/ad hoc. [Microsoft WorkLab, 2025](https://www.microsoft.com/en-us/worklab/work-trend-index/breaking-down-infinite-workday)
- Product Hunt is full of meeting-to-action products. A 2026 Atter AI discussion says summaries stranded in Google Docs still create work, but competitors such as ActFlux, Rumi, Fireflies, Fellow, and SnapLinear already attack that exact gap. [Atter AI](https://www.producthunt.com/products/atter-ai-ai-transcription-for-meetings), [ActFlux](https://www.producthunt.com/products/actflux/), [Rumi](https://www.producthunt.com/products/rumiai), [SnapLinear](https://www.producthunt.com/products/snaplinear?launch=snaplinear)

A product here needs a narrow audience and observable outcome, such as "turn a photographed benefits letter into one safe next action" rather than "manage your life."

## Pre-pivot product concepts (not shipped)

### 1. IntentGate: semantic action firewall for OpenAI agents

**Pitch:** Agents can read anything, but they can only do what you meant.

**Demo:** A user asks an email agent to summarize vendor messages. One email contains an indirect injection instructing it to upload a private file. IntentGate renders a one-line effect preview, identifies the untrusted provenance, blocks the unrelated upload, and permits the summary. A second safe write receives a one-use capability token.

**OpenAI fit:** Responses API/Agents SDK for the working agent; structured outputs for action plans; a separate policy/evaluator call; tool-call interception; tracing/evals; optional computer use for the visual attack. Use deterministic policies first and model judgment only for semantic intent matching.

**MVP:** Tool proxy, intent contract, data provenance labels, effect diff, allow/deny/ask, expiring scoped token, audit replay, three attacks. No claim of universal prompt-injection prevention.

**Why it can place:** It shows a frightening failure and a legible fix in under two minutes, demonstrates multiple OpenAI primitives, and addresses a problem NIST/OWASP/GitHub/OpenAI users are actively wrestling with.

### 2. TrustCall: live scam interruption and independent verification

**Pitch:** When a caller creates urgency, TrustCall creates a pause and a trusted path to the truth.

**Demo:** A simulated "grandchild" call asks for secret bail payment. Realtime transcription detects urgency + secrecy + money, speaks a calm warning, prevents payment guidance, and sends a verification request to the trusted grandchild contact. The genuine contact denies the story; the interface displays the mismatch and FTC-backed next steps.

**OpenAI fit:** Realtime API for low-latency audio/transcription, structured extraction of scam tactics, tool calling to a trusted-contact service, multilingual voice, and a small policy engine. Do not market voice-clone detection.

**MVP:** Browser call room rather than carrier integration; trusted circle; claimed-identity extraction; risk cues with transcript spans; call-back/one-tap verification; after-call incident packet.

**Why it can place:** $3.5B of reported annual harm, immediate emotional comprehension, excellent voice demo, and a safety approach aligned with FTC advice rather than unreliable media forensics.

### 3. ClearPath: cited prior-auth appeal navigator

**Pitch:** A denial letter should become a checklist, not a dead end.

**Demo:** Upload a synthetic denial letter, payer policy, and synthetic chart. ClearPath extracts deadlines and the denial reason, highlights missing policy criteria, links every proposed statement to the chart/policy span, and produces a clinician-review packet. A red-team view catches an unsupported clinical assertion and refuses to include it.

**OpenAI fit:** Vision/document parsing, file search/vector stores, structured outputs, citation spans, agent orchestration for policy/chart/quality review, and evals against physician-validated synthetic cases.

**MVP:** One procedure and one insurer policy; synthetic data only; no medical advice; clinician approval required; export checklist and draft.

**Why it can place:** High human impact, strong current KFF/AMA evidence, visibly rigorous grounding, and a narrow workflow where the model's weakness in administrative scaffolding can be directly improved.

### 4. ProofPR: evidence, not another AI opinion

**Pitch:** Every AI-generated change arrives with a reproducible proof packet.

**Demo:** An agent submits a plausible fix. ProofPR maps it to an acceptance criterion, generates a property test and a failing counterexample, runs both in a sandbox, and produces a six-line reviewer packet with commands and traces. A competing prose-only review misses the regression.

**OpenAI fit:** Codex/Responses for repository work, shell/computer tools in a sandbox, structured evidence schema, adversarial verifier agent, and evals on seeded defects.

**MVP:** GitHub diff upload, issue/criterion mapping, deterministic test execution, counterexample generation, compact evidence bundle. Avoid generic line comments.

**Why it may not place:** Excellent demo, but 139 observed review products make positioning difficult. "Proof packet" must remain the entire product identity.

### 5. EvidenceIEP: teacher-owned observation and compliance ledger

**Pitch:** Speak one observation once; reuse it everywhere it is required, with its evidence attached.

**Demo:** A teacher records a short classroom observation. The product transcribes it, suggests the relevant existing goal, drafts progress language, shows the observation/date as evidence, and exports to three mock district fields. The teacher accepts or edits every statement.

**OpenAI fit:** Speech-to-text/Realtime, structured extraction, file search over the existing IEP and district rubric, grounded drafting, and audit history.

**MVP:** Synthetic student data; one progress-report workflow; local encryption; no goal creation or eligibility decisions; teacher remains author.

**Why it can place:** Strong educator story and direct relief from duplicated work, but privacy and district-specific integrations make a production claim harder than the first three concepts.

## Recommendation at research time (superseded)

Build **IntentGate** unless hackathon rules strongly reward consumer/social impact over infrastructure. In that case, build **TrustCall**.

The winning version of IntentGate should not look like a security dashboard. It should look like a working assistant that calmly refuses one malicious action for a reason the user instantly understands, then completes the safe task. The centerpiece is a **before/after live exploit**, backed by an intent contract, provenance trail, and effect preview.

Avoid these weak pitches:

- "An AI agent that manages your inbox/calendar/tasks."
- "An AI meeting summarizer that creates action items."
- "An AI code reviewer with multiple agents."
- "A chatbot for medical appeals."
- "An AI detector for cloned voices."
- "A citation checker" without proprietary distribution or data.

## Research caveats

- Social platforms contain promotion, selection bias, deleted posts, and unverifiable anecdotes. They are used to discover pain language, not estimate population prevalence.
- Reddit vote counts and Product Hunt ranks can change.
- Some 2026 papers are preprints and should not be treated as settled clinical or security evidence.
- Fraud, health, education, and security products require human review, careful privacy design, red-team testing, and narrowly worded claims.
- The competitive scan is directional. A final concept should receive a fresh trademark, patent, app-store, and accelerator/launch search before submission.
