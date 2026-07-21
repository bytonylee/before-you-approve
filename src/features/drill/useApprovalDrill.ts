import { useEffect, useMemo, useReducer } from "react";

export type LearnerDecision = "allow" | "review" | "block";
export type DrillStatus = "running" | "paused" | "ended" | "complete";

export interface DrillProvenance {
  source: string;
  trust: "trusted" | "untrusted" | "restricted";
  evidence?: string;
}

export interface DrillTrustContext {
  source: string;
  trust: "trusted" | "untrusted" | "restricted";
  role: string;
  canAuthorize: boolean;
  note: string;
}

export interface DrillAction {
  id: string;
  at?: string;
  tool: string;
  operation: string;
  arguments: Record<string, unknown>;
  target?: string;
  provenance: DrillProvenance;
  effect: string;
  reversible: boolean;
  correctDecision: LearnerDecision;
  explanation: string;
  harmful: boolean;
  safeCounterfactual?: string;
}

export interface DrillScenario {
  id: string;
  title: string;
  learnerTask: string;
  difficulty: string;
  skill: string;
  trustContext: string | Array<string | DrillTrustContext>;
  actions: DrillAction[];
}

export interface DrillAnswer {
  choice: LearnerDecision;
  correct: boolean;
  decisionSeconds: number;
}

export interface DrillMetrics {
  attempted: number;
  correct: number;
  score: number;
  catchRate: number | null;
  falseBlocks: number;
  unsafeAllows: number;
  unnecessaryBlocks: number;
}

export interface ApprovalDrillState {
  currentIndex: number;
  answers: Record<string, DrillAnswer>;
  status: DrillStatus;
  decisionSeconds: number;
}

export type ApprovalDrillEvent =
  | { type: "tick"; actionId: string }
  | { type: "choose"; actionId: string; choice: LearnerDecision; correctDecision: LearnerDecision }
  | { type: "next"; actionId: string; isLast: boolean }
  | { type: "toggle-pause" }
  | { type: "end" }
  | { type: "reset" };

export function createApprovalDrillState(): ApprovalDrillState {
  return {
    currentIndex: 0,
    answers: {},
    status: "running",
    decisionSeconds: 0,
  };
}

export function reduceApprovalDrill(
  state: ApprovalDrillState,
  event: ApprovalDrillEvent,
): ApprovalDrillState {
  switch (event.type) {
    case "tick":
      if (state.status !== "running" || state.answers[event.actionId]) return state;
      return { ...state, decisionSeconds: state.decisionSeconds + 1 };
    case "choose":
      if (state.status !== "running" || state.answers[event.actionId]) return state;
      return {
        ...state,
        answers: {
          ...state.answers,
          [event.actionId]: {
            choice: event.choice,
            correct: event.choice === event.correctDecision,
            decisionSeconds: state.decisionSeconds,
          },
        },
      };
    case "next":
      if (state.status === "ended" || !state.answers[event.actionId]) return state;
      if (event.isLast) return { ...state, status: "complete" };
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        decisionSeconds: 0,
        status: "running",
      };
    case "toggle-pause":
      if (state.status === "running") return { ...state, status: "paused" };
      if (state.status === "paused") return { ...state, status: "running" };
      return state;
    case "end":
      return state.status === "complete" ? state : { ...state, status: "ended" };
    case "reset":
      return createApprovalDrillState();
  }
}

export function getMetrics(actions: DrillAction[], answers: Record<string, DrillAnswer>): DrillMetrics {
  const answeredActions = actions.filter((action) => answers[action.id]);
  const correct = answeredActions.filter((action) => answers[action.id].correct).length;
  const blockActions = answeredActions.filter((action) => action.correctDecision === "block");
  const caught = blockActions.filter((action) => answers[action.id].choice !== "allow").length;
  const falseBlocks = answeredActions.filter(
    (action) => action.correctDecision !== "block" && answers[action.id].choice === "block",
  ).length;
  const unsafeAllows = blockActions.filter((action) => answers[action.id].choice === "allow").length;

  return {
    attempted: answeredActions.length,
    correct,
    score: answeredActions.length ? Math.round((correct / answeredActions.length) * 100) : 0,
    catchRate: blockActions.length ? Math.round((caught / blockActions.length) * 100) : null,
    falseBlocks,
    unsafeAllows,
    unnecessaryBlocks: falseBlocks,
  };
}

export function useApprovalDrill(scenario: DrillScenario) {
  const [state, dispatch] = useReducer(reduceApprovalDrill, undefined, createApprovalDrillState);
  const { answers, currentIndex, decisionSeconds, status } = state;

  const currentAction = scenario.actions[currentIndex];
  const currentAnswer = currentAction ? answers[currentAction.id] : undefined;
  const metrics = useMemo(() => getMetrics(scenario.actions, answers), [answers, scenario.actions]);

  useEffect(() => {
    if (status !== "running" || currentAnswer || !currentAction) return;
    const interval = window.setInterval(() => {
      dispatch({ type: "tick", actionId: currentAction.id });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [currentAction, currentAnswer, status]);

  useEffect(() => {
    dispatch({ type: "reset" });
  }, [scenario.id]);

  const choose = (choice: LearnerDecision) => {
    if (!currentAction || currentAnswer || status !== "running") return;
    dispatch({
      type: "choose",
      actionId: currentAction.id,
      choice,
      correctDecision: currentAction.correctDecision,
    });
  };

  const next = () => {
    if (!currentAnswer || status === "ended") return;
    dispatch({
      type: "next",
      actionId: currentAction.id,
      isLast: currentIndex >= scenario.actions.length - 1,
    });
  };

  const togglePause = () => {
    dispatch({ type: "toggle-pause" });
  };

  const end = () => {
    dispatch({ type: "end" });
  };

  const replay = () => {
    dispatch({ type: "reset" });
  };

  return {
    answers,
    choose,
    currentAction,
    currentAnswer,
    currentIndex,
    decisionSeconds,
    end,
    metrics,
    next,
    replay,
    status,
    togglePause,
  };
}
