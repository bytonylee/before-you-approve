# OpenAI Build Week: official rules and compliance brief

Research checked against first-party OpenAI and Devpost sources on **2026-07-22 KST**. The [Official Rules](https://openai.devpost.com/rules) control if another page, update, plugin output, or promotional statement conflicts with them (Rules Sections 5.1 and 12.4).

The official overview showed **more than 46,000 participants** during this review, substantially above the 30,000 figure in the request. This is a live counter and may continue changing. Source: [official challenge overview](https://openai.devpost.com/).

## Immediate deadline risk

- **Submission and registration close Tuesday, July 21, 2026 at 5:00 PM Pacific Daylight Time.** That is **Wednesday, July 22 at 9:00 AM KST**. Source: [Official Rules, Section 1](https://openai.devpost.com/rules) and the [latest official deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips).
- The official update recommends submitting about three hours early while continuing to polish, making **about 6:00 AM KST** the practical safety target. Source: [latest official deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips).
- The submission period opened July 13 at 9:00 AM PT. Work on a new project must be done during this period; a pre-existing project is allowed only if meaningfully extended with Codex and/or GPT-5.6 after the period started, with old and new work clearly distinguished by evidence such as timestamped Codex logs and dated commits. Source: [Official Rules, Project Requirements](https://openai.devpost.com/rules).
- **No late entries or ordinary post-deadline edits.** The latest update says submissions lock at 5:00 PM PT and no project, video, team, or other changes should be made afterward without risking eligibility. The rules permit only sponsor-approved, substantively neutral fixes for infringement, personal information, or inappropriate material. Sources: [latest official deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips) and [Official Rules, Section 6](https://openai.devpost.com/rules).
- Official Rules say judging runs July 22 at 10:00 AM PT through August 5 at 5:00 PM PT, with winners announced around August 12 at 2:00 PM PT. The separate schedule page currently says July 22 at 9:00 AM through August 9 at 5:00 PM. This is an official-page discrepancy; the Rules say they prevail. Sources: [Official Rules, Sections 1 and 12.4](https://openai.devpost.com/rules) and [schedule page](https://openai.devpost.com/details/dates).

## What must be built

The project must be built **with Codex and GPT-5.6**, be working/runnable on its stated platform, behave as depicted in the description/video, and fit exactly one of these tracks:

| Track | Official scope |
|---|---|
| Apps for Your Life | Consumer apps for everyday life: productivity, creativity, home, family, travel, health, or personal finance |
| Work and Productivity | Team effectiveness: workflow automation, customer support, analytics, sales, or back-office operations |
| Developer Tools | Developer testing, DevOps, agentic workflows, or security |
| Education | AI projects for students, teachers, or educational organizations |

Examples may include web/native apps, backend tools, games, and agent plugins such as skills, MCPs, or tools. Source: [Official Rules, Project Requirements](https://openai.devpost.com/rules).

### Sponsor-stack clarification

- **Genuine use of both Codex and GPT-5.6 is mandatory.** At minimum, GPT-5.6 must be used for part of the project; other models may be used for the rest. Free users can use GPT-5.6 Terra. Source: [official Tuesday clarification](https://openai.devpost.com/updates/45371-tuesday-last-minute-tips).
- **An OpenAI API integration is not mandatory, and API credits are not required.** The latest official update says this explicitly. GPT-5.6 does not have to power the deployed runtime. Source: [latest official deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips).
- The offered $100 credits were **Codex credits, not API credits**, and the available pool is exhausted. Free-tier participation remains allowed. Source: [official resources page](https://openai.devpost.com/resources).
- If an OpenAI API integration is nevertheless used, the current official [GPT-5.6 API guide](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6) describes the Sol, Terra, and Luna variants and recommends the Responses API for reasoning, tools, and multi-turn workflows. This is useful implementation guidance, not an additional hackathon mandate.
- Third-party SDKs, APIs, models, data, and open-source components are allowed only when the entrant is authorized to use them and follows their terms/licenses. Open-source use must add or enhance functionality rather than merely repackage it. Source: [Official Rules, Project Requirements and Intellectual Property](https://openai.devpost.com/rules).

## Eligibility

- Eligible individual entrants must be at least the age of majority where they reside. Parents/guardians may enter for students under 18 or under the local age of majority. Teams of eligible people and properly organized eligible organizations may enter. A team/organization must authorize one eligible representative to submit on its behalf. Source: [Official Rules, Section 3](https://openai.devpost.com/rules).
- Entrants must reside or be organized in a country/territory that supports OpenAI API access and must not fall within the rule's exclusions. South Korea is currently included in OpenAI's [official supported-country list](https://developers.openai.com/api/docs/supported-countries). Confirm the actual entrant's residence, age, and organization status rather than assuming eligibility from the workspace timezone.
- Excluded groups include residents/organizations where U.S. or local law prohibits participation or receiving a prize; the rules specifically list Brazil, Quebec, Russia, Crimea, Cuba, Iran, North Korea, and Syria among examples. Promotion entities and their employees/agents/immediate family or household members, judges and their employers, related affiliates, people involved in running the event, and entrants presenting a real/apparent conflict are also excluded. Source: [Official Rules, Section 3](https://openai.devpost.com/rules).
- An eligible person may enter individually and join multiple teams/organizations. Multiple submissions are allowed, even in the same track, but each must be unique and substantially different. Each project is entered in one track, evaluated separately, and is eligible for only one prize. Sources: [Official Rules, Sections 3, 4 and 9](https://openai.devpost.com/rules) and the [Devpost discussion clarification](https://openai.devpost.com/forum_topics/44478-multiple-submission).
- A project may not have been developed or derived from a project that received financial or preferential support from OpenAI or Devpost before the submission period ended, including funding/investment, development under contract, or a commercial license from either. Source: [Official Rules, Financial or Preferential Support](https://openai.devpost.com/rules).

## Submission package

Every required element must be complete and submitted through Devpost before the deadline:

1. **Working project:** reliably installable/runnable on its intended platform and consistent with the demo and description.
2. **One category/track:** choose the best-fitting of the four tracks.
3. **English project description:** explain features and functionality. Non-English materials require English translations, including video, description, testing instructions, and all other submitted materials.
4. **Demo video:** a **publicly viewable YouTube link, under three minutes**, with a clear working demo and audio/voiceover that explicitly explains (a) what was built, (b) how Codex was used, and (c) how GPT-5.6 was used. Judges need not watch after three minutes. The official update says **unlisted is acceptable** and self-recorded or AI-assisted voiceover is acceptable; music-only is not. Do not include third-party trademarks, copyrighted music, or other copyrighted content without permission. Sources: [Official Rules, Submission Requirements](https://openai.devpost.com/rules), [opening update](https://openai.devpost.com/updates/45282-openai-build-week-submissions-are-open-plugin-launch), and [latest deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips).
5. **Code repository URL:** either public with a relevant license, or private and shared with both `testing@devpost.com` and `build-week-event@openai.com`. The latest update warns that an unshared private repo at the deadline can cause disqualification.
6. **README:** setup/run instructions; sample data if needed; where Codex accelerated the work; key human product, engineering, and design decisions; and specific evidence of how Codex and GPT-5.6 contributed throughout. For a pre-existing project, separate old work from eligible-period additions and include dated evidence.
7. **Codex `/feedback` Session ID:** supply the single ID from the primary Codex thread where the majority of core functionality was built. The official forum clarification says to choose the most representative thread and document other threads in the README. Run `/feedback` from the slash-command menu in an official Codex interface rather than sending it as normal chat text. Sources: [Official Rules](https://openai.devpost.com/rules), [forum clarification on multiple sessions](https://openai.devpost.com/forum_topics/44481-2-session-ids), and [latest deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips).
8. **Judge-ready access:** provide a website, hosted demo, test build, or equivalent, free and unrestricted through the judging period. Include credentials for a private site. Judges may judge only from the text, images, and video and are not required to test. For a plugin/developer tool, also include installation instructions, supported platforms, and a way to test without rebuilding, such as a hosted demo, sandbox, or test account. A Docker build is acceptable when it is easy to run and verify, according to the [Devpost discussion clarification](https://openai.devpost.com/forum_topics/44458-clarification-on-docker-test-builds-and-gpt-5-6-integration).
9. **Team state:** add all team members and ensure every invitation is accepted before the deadline. Confirm the project is marked **Submitted**, not merely saved as a draft. Source: [latest official deadline checklist](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips).

## Judging

### Stage One: pass/fail

The submission must meet a baseline of viability: it reasonably fits the challenge theme/selected track and reasonably applies the required hackathon tools. Official updates resolve the awkward Rules wording about "required APIs/SDKs": API use is not required; make the required **Codex + GPT-5.6** use unmistakable in the README, video, and repository. Sources: [Official Rules, Section 7](https://openai.devpost.com/rules), [latest official update](https://openai.devpost.com/updates/45402-deadline-tomorrow-last-minute-tips), and [Devpost Stage One clarification](https://openai.devpost.com/forum_topics/44458-clarification-on-docker-test-builds-and-gpt-5-6-integration).

### Stage Two: four equal criteria (25% each)

| Criterion | What the rules ask |
|---|---|
| Technological Implementation | How thoroughly and skillfully the project uses Codex; genuine effort and a working, non-trivial implementation |
| Design | A working/runnable, complete, coherent product experience rather than only a technical proof of concept |
| Potential Impact | A credible and specific real problem, real audience, and demonstrated solution that actually addresses it |
| Quality of the Idea | Creativity, novelty, and differentiation from existing concepts |

The criteria are explicitly equally weighted. Tie-breaking compares them in the listed order, so **Technological Implementation is the first tie-break, then Design, Potential Impact, and Quality of the Idea**. Judges may be sponsor employees or third parties; panels/methods may change and may include expert panels, peer review, and automated AI-driven analysis. Source: [Official Rules, Section 7](https://openai.devpost.com/rules).

The overview currently lists Thibault Sottiaux (Head of Product & Platform), Kath Korevec (Member of Product Staff), Tara Seshan (Member of Product Staff), Leah Belsky (VP of Education), and Peter Steinberger (Member of Technical Staff, Clawfather). The Rules permit the roster to change. Source: [official challenge overview](https://openai.devpost.com/).

## Prizes

There is **$100,000 total cash** and eight winning slots, not a global top-three structure:

- **First place in each of four tracks:** one winner per track, **$15,000 cash**, promotion by OpenAI Developers, a meeting with the Codex team, one year of a Pro Account, and up to two DevDay passes per team (stated value $650 each).
- **Second place in each of four tracks:** one winner per track, **$10,000 cash**, promotion by OpenAI Developers, and one year of a Pro Account.
- Each project may receive only one prize. DevDay travel, lodging, visas, taxes, and other unstated expenses are the recipient's responsibility. If unable to attend DevDay on September 29, 2026, the first-place recipient may receive up to two passes to an alternate DevDay Exchange event, subject to availability and later terms.
- Winners remain potential winners until identity, qualifications, and role in the submission are verified. Required winner forms must be returned within ten business days after being sent. Winners bear taxes, banking/exchange fees, and may need W-9/W-8BEN or other forms.

Source: [Official Rules, Section 9](https://openai.devpost.com/rules).

## IP, privacy, and publicity

- Entrants retain ownership of their submissions. Submission grants OpenAI a non-exclusive license to use the entry for judging. Source: [Official Rules, Section 8](https://openai.devpost.com/rules).
- The submission must be original, solely owned by the entrant/team/organization, and not infringe copyright, trademark, patent, contract, privacy, publicity, or other rights. Any contractor assistance must still result in entrant-owned work based on the entrant's ideas/creativity. Source: [Official Rules, Project Requirements and Section 8](https://openai.devpost.com/rules).
- OpenAI and Devpost may promote the submission and use contributors' names, likenesses, voices, and images in hackathon/result publicity during the hackathon and for three years afterward. Some components may be publicly displayed; other materials may be viewed by OpenAI, Devpost, and judges. Source: [Official Rules, Section 8](https://openai.devpost.com/rules).
- Participation also consents to promotional display of the submission and use of personal information including name, likeness, photograph, voice, opinions, comments, hometown, and country, in current or future media worldwide, without further payment or review unless prohibited by law. Source: [Official Rules, Section 11](https://openai.devpost.com/rules).
- The entrant relationship with OpenAI/Devpost is not confidential, fiduciary, or otherwise special. Do not put secrets, third-party confidential material, or unnecessary personal data in the submission or repository. Source: [Official Rules, Section 10](https://openai.devpost.com/rules).
- An official Devpost manager said the exact privacy/access scope of the `/feedback` Session ID was still being checked with OpenAI; the public thread does not yet contain a substantive answer. Treat this as unresolved and avoid placing secrets in the primary build thread. Source: [Devpost manager response](https://openai.devpost.com/forum_topics/44479-clarification-feedback-session-id-and-thread-access).

## Actionable compliance checklist

### Eligibility and ownership

- [ ] Confirm every entrant is age-eligible, resident/domiciled in an allowed jurisdiction, and free of listed conflicts/exclusions.
- [ ] Name one authorized team/organization representative.
- [ ] Confirm the project and every asset are entrant-owned or properly licensed; preserve license/permission records.
- [ ] Confirm no disqualifying OpenAI/Devpost financial or preferential support.
- [ ] For pre-existing work, label the pre-period baseline and document only eligible additions with dated commits/session evidence.

### Build and judging proof

- [ ] Select exactly one track and state a specific real audience and problem.
- [ ] Demonstrate a working, non-trivial, coherent end-to-end experience, not a mock or isolated proof of concept.
- [ ] Use Codex genuinely and use GPT-5.6 for at least one material part of the project.
- [ ] Make Codex and GPT-5.6 evidence obvious in the code/repo, README, and demo.
- [ ] Verify all third-party APIs, datasets, fonts, images, audio, models, and dependencies are authorized and license-compliant.

### Submission artifacts

- [ ] Project description is clear, specific, and in English.
- [ ] YouTube demo is viewable in an incognito window, under 3:00, and contains a clear voiceover covering the product, Codex use, and GPT-5.6 use.
- [ ] Video contains no unlicensed trademarks, music, footage, or other protected material.
- [ ] Repository URL works; public repo has an appropriate license, or private repo is shared with both required email addresses.
- [ ] README includes fresh setup/run steps, sample data, credentials/testing path, human decisions, Codex/GPT-5.6 contribution, and old/new-work distinction if relevant.
- [ ] Hosted demo/test build is free, reliable, and judge-ready through the controlling Rules' judging end date; credentials are included where needed.
- [ ] Plugin/devtool submission includes install steps, supported platforms, and a no-rebuild test path.
- [ ] Run `/feedback` from the slash menu in the primary official Codex thread and paste its single Session ID into the form; document other threads in the README.
- [ ] Add all teammates and confirm they accepted invitations.
- [ ] Submit early; verify Devpost `My Projects` shows **Submitted** in green, not Draft.
- [ ] Do not make ordinary submission changes after 5:00 PM PT.

## Source hierarchy and unresolved items

1. [Official Rules](https://openai.devpost.com/rules) are controlling.
2. The [challenge overview](https://openai.devpost.com/), [resources](https://openai.devpost.com/resources), and [official updates](https://openai.devpost.com/updates) provide sponsor/administrator clarifications.
3. The optional Devpost Hackathons plugin is explicitly **not** a source of truth; its AI output may be wrong. Verify every claim against the rules/site. Source: [Official Rules, Section 5](https://openai.devpost.com/rules).
4. The [FAQ page](https://openai.devpost.com/details/faqs) did not expose readable content to the research crawler. Relevant current clarifications were instead verified from official updates and Devpost-hosted discussions. Forum posts without an organizer/manager answer were not treated as authoritative.
5. The judging-period conflict noted above remains unresolved publicly; use the Official Rules' dates unless OpenAI/Devpost formally amends the Rules.
