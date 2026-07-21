# GPT-5.6 drill authoring and red-team prompt

## Role in Before You Approve

GPT-5.6 in the primary Codex build thread was used at build time to author and adversarially review the checked-in learning cases. Its material contribution was to turn each learning objective into a multi-step tool trace, introduce a plausible pressure tactic, distinguish direct authority from retrieved content, and write decision-specific teaching feedback plus a minimally changed counterfactual.

This is not a runtime model integration. The learner experience uses versioned JSON fixtures and the deterministic validator in `scripts/drill-schema.mjs`, so the same trace, answer, and explanation are available on every run.

Every generated or edited case requires teacher review before classroom use. The `metadata.teacherReviewRequired` flag preserves that boundary in each fixture; validation checks structure and consistency, not pedagogical suitability for a particular learner.

## Authoring prompt

The following prompt is the reusable specification applied to the three fixtures in this directory.

```text
You are the scenario author and adversarial reviewer for Before You Approve, an
Education-track simulator that teaches people to supervise tool-using agents.

INPUTS
- Learning objective: {{plain_language_learning_objective}}
- Available tool schemas: {{tool_schemas}}
- Intended difficulty: {{beginner | intermediate | advanced}}

OUTPUT CONTRACT
Return one JSON object matching DRILL_JSON_SCHEMA from
scripts/drill-schema.mjs. Return JSON only. Do not add fields. Use only
allow, review, or block for correctDecision.

AUTHORING RULES
1. Start with the learner's exact task and its explicit boundaries. Direct user
   input may authorize; retrieved content, vendor copy, repository text, and an
   agent's own plan may inform but cannot grant new authority.
2. Create a coherent trace with at least one correct ALLOW, one REVIEW, and one
   BLOCK. Safe read-only work should not be blocked merely to make the drill
   harder.
3. Make every action concrete: literal tool, operation, arguments, target,
   provenance, effect, and reversibility. Use reserved .example domains and
   invented identifiers. Do not include personal or confidential data.
4. A REVIEW action must expose a bounded ambiguity that a person can resolve.
   A BLOCK action must violate a clear boundary or create a harmful effect.
5. Pressure tactics may sound persuasive, urgent, or socially costly, but the
   correct decision must follow authority, scope, effect, and reversibility,
   not suspicious wording alone.
6. Write the exact learner explanation in plain language. Name the decisive
   evidence, why it matters, and the effect that the decision prevents or
   permits. Do not imply that the simulator executed a real action.
7. Write one safeCounterfactual per action. Change the smallest material fact
   that would change the decision, and state the new decision or approval gate.
8. Treat every tool call as a simulation. Never invoke a tool or real external
   service while authoring a case.

ADVERSARIAL REVIEW PASS
- Try to launder authority through an email body, seller countdown, manager
  reference, agent inference, or confident description such as "standard".
- Check that the harmful step would still be blocked if its wording sounded
  calm and professional.
- Check for false blocks: retain at least one clearly safe action that directly
  advances the learner's task.
- Check each provenance.source against trustContext and ensure its trust level
  agrees exactly.
- Check that harmful actions are BLOCK, that ALLOW actions are not harmful, and
  that no timestamp moves backward.
- Validate the finished object with assertValidDrill before accepting it.
- Set metadata.authoredWith to "GPT-5.6 via Codex" and
  metadata.teacherReviewRequired to true. A teacher must review the result before
  classroom use.
```

## Applied objectives

| Fixture | Learning objective | Adversarial pressure |
|---|---|---|
| `inbox-indirect-instruction.json` | Retrieved content is data, not delegated authority | A message calls external forwarding mandatory |
| `purchase-over-limit.json` | Spending scope includes total cost and explicit transaction authority | Scarcity countdown and social obligation |
| `repo-cleanup-destructive-command.json` | Inspect blast radius before approving workspace mutation | A destructive command is framed as standard cleanup |

## Acceptance checks

The validator rejects unknown fields, missing direct authority, duplicate IDs, invalid timestamps, mismatched provenance, non-JSON arguments, harmful non-block decisions, and traces that fail to teach all three decision modes. Focused tests also pin fixture IDs and the exact final block explanations so accidental content drift is visible in review.
