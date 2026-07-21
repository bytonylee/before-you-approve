import { describe, expect, it } from "vitest";
import {
  createApprovalDrillState,
  getMetrics,
  reduceApprovalDrill,
  type DrillAction,
  type DrillAnswer,
} from "../src/features/drill/useApprovalDrill";

const actions: DrillAction[] = [
  {
    id: "safe-read",
    tool: "records.read",
    operation: "read",
    arguments: { id: "synthetic-1" },
    provenance: { source: "learner", trust: "trusted" },
    effect: "Reads one synthetic record.",
    reversible: true,
    correctDecision: "allow",
    explanation: "The narrow read matches the task and does not change state.",
    harmful: false,
  },
  {
    id: "ambiguous-write",
    tool: "records.update",
    operation: "update",
    arguments: { id: "synthetic-1" },
    provenance: { source: "agent-plan", trust: "restricted" },
    effect: "Changes a field without a specified value.",
    reversible: true,
    correctDecision: "review",
    explanation: "The write needs a value and explicit scope before it can run.",
    harmful: false,
  },
  {
    id: "unsafe-send",
    tool: "mail.send",
    operation: "send",
    arguments: { recipient: "outside.example" },
    provenance: { source: "retrieved-content", trust: "untrusted" },
    effect: "Sends synthetic content to an external destination.",
    reversible: false,
    correctDecision: "block",
    explanation: "Retrieved content cannot authorize an external disclosure.",
    harmful: true,
  },
];

function answer(choice: DrillAnswer["choice"], correct: boolean): DrillAnswer {
  return { choice, correct, decisionSeconds: 4 };
}

describe("approval drill metrics", () => {
  it("separates unsafe allows from unnecessary blocks", () => {
    expect(getMetrics(actions, {
      "safe-read": answer("block", false),
      "ambiguous-write": answer("review", true),
      "unsafe-send": answer("allow", false),
    })).toEqual({
      attempted: 3,
      correct: 1,
      score: 33,
      catchRate: 0,
      falseBlocks: 1,
      unsafeAllows: 1,
      unnecessaryBlocks: 1,
    });
  });

  it("does not invent a catch rate before a harmful action is answered", () => {
    expect(getMetrics(actions, {
      "safe-read": answer("allow", true),
    })).toMatchObject({
      attempted: 1,
      correct: 1,
      score: 100,
      catchRate: null,
      unsafeAllows: 0,
      unnecessaryBlocks: 0,
    });
  });

  it("uses the reviewed decision, not a broad harm flag, to classify blocks", () => {
    const boundaryOnlyBlock: DrillAction = {
      ...actions[0],
      id: "boundary-only-block",
      correctDecision: "block",
      harmful: false,
    };

    expect(getMetrics([boundaryOnlyBlock], {
      "boundary-only-block": answer("block", true),
    })).toMatchObject({
      correct: 1,
      unsafeAllows: 0,
      unnecessaryBlocks: 0,
    });

    expect(getMetrics([boundaryOnlyBlock], {
      "boundary-only-block": answer("allow", false),
    })).toMatchObject({
      correct: 0,
      unsafeAllows: 1,
      unnecessaryBlocks: 0,
    });
  });
});

describe("approval drill state machine", () => {
  it("times, pauses, records one decision, and advances only after an answer", () => {
    let state = createApprovalDrillState();
    const unchanged = reduceApprovalDrill(state, { type: "next", actionId: "safe-read", isLast: false });
    expect(unchanged).toBe(state);

    state = reduceApprovalDrill(state, { type: "tick", actionId: "safe-read" });
    state = reduceApprovalDrill(state, { type: "toggle-pause" });
    expect(state).toMatchObject({ status: "paused", decisionSeconds: 1 });
    expect(reduceApprovalDrill(state, { type: "tick", actionId: "safe-read" })).toBe(state);

    state = reduceApprovalDrill(state, { type: "toggle-pause" });
    state = reduceApprovalDrill(state, {
      type: "choose",
      actionId: "safe-read",
      choice: "allow",
      correctDecision: "allow",
    });
    expect(state.answers["safe-read"]).toEqual({ choice: "allow", correct: true, decisionSeconds: 1 });
    expect(reduceApprovalDrill(state, {
      type: "choose",
      actionId: "safe-read",
      choice: "block",
      correctDecision: "allow",
    })).toBe(state);

    state = reduceApprovalDrill(state, { type: "next", actionId: "safe-read", isLast: false });
    expect(state).toMatchObject({ status: "running", currentIndex: 1, decisionSeconds: 0 });
  });

  it("supports end, reset, and terminal completion without reopening a run", () => {
    let state = createApprovalDrillState();
    state = reduceApprovalDrill(state, {
      type: "choose",
      actionId: "final",
      choice: "block",
      correctDecision: "block",
    });
    state = reduceApprovalDrill(state, { type: "next", actionId: "final", isLast: true });
    expect(state.status).toBe("complete");
    expect(reduceApprovalDrill(state, { type: "toggle-pause" })).toBe(state);
    expect(reduceApprovalDrill(state, { type: "end" })).toBe(state);

    state = reduceApprovalDrill(state, { type: "reset" });
    expect(state).toEqual(createApprovalDrillState());
    state = reduceApprovalDrill(state, { type: "end" });
    expect(state.status).toBe("ended");
    expect(reduceApprovalDrill(state, { type: "next", actionId: "final", isLast: true })).toBe(state);
  });
});
