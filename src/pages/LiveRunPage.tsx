import {
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Fingerprint,
  ListRestart,
  MessageCircleQuestionMark,
  OctagonAlert,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Target,
  TerminalSquare,
  Timer,
  X,
} from "lucide-react";
import inboxScenarioJson from "../../cases/inbox-indirect-instruction.json";
import purchaseScenarioJson from "../../cases/purchase-over-limit.json";
import repositoryScenarioJson from "../../cases/repo-cleanup-destructive-command.json";
import {
  type DrillAction,
  type DrillAnswer,
  type DrillScenario,
  type DrillStatus,
  type LearnerDecision,
  useApprovalDrill,
} from "../features/drill/useApprovalDrill";

interface LiveRunPageProps {
  notify: (message: string) => void;
  onOpenModel: () => void;
}

const inboxScenario = inboxScenarioJson as DrillScenario;
const purchaseScenario = purchaseScenarioJson as DrillScenario;
const repositoryScenario = repositoryScenarioJson as DrillScenario;

const scenariosBySelection: Record<string, DrillScenario> = {
  "inbox-injection": inboxScenario,
  "inbox_indirect_instruction": inboxScenario,
  "purchase-limit": purchaseScenario,
  "purchase_over_limit": purchaseScenario,
  "repository-cleanup": repositoryScenario,
  "repo_cleanup_destructive_command": repositoryScenario,
};

function getSelectedScenario(): DrillScenario {
  const selection = window.localStorage.getItem("before-you-approve:selected-case");
  return (selection && scenariosBySelection[selection]) || inboxScenario;
}

const decisionCopy: Record<LearnerDecision, { label: string; helper: string }> = {
  allow: { label: "Allow", helper: "Proceed as proposed" },
  review: { label: "Ask", helper: "Request missing scope" },
  block: { label: "Block", helper: "Prevent this effect" },
};

const statusCopy: Record<DrillStatus, string> = {
  running: "Drill active",
  paused: "Paused",
  ended: "Run ended",
  complete: "Drill complete",
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function trustLabel(trust: DrillAction["provenance"]["trust"]): string {
  if (trust === "untrusted") return "Untrusted content";
  if (trust === "restricted") return "Restricted source";
  return "Direct or delegated authority";
}

function simulatedConsequence(effect: string): string {
  const pastTenseStarts: Array<[string, string]> = [
    ["Sends ", "sent "],
    ["Charges ", "charged "],
    ["Deletes ", "deleted "],
  ];
  const match = pastTenseStarts.find(([present]) => effect.startsWith(present));
  if (!match) return `This simulation would have executed the proposed effect: ${effect}`;
  const [present, past] = match;
  return `This simulation would have ${past}${effect.slice(present.length)}`;
}

function DecisionMark({ decision, pending = false }: { decision?: LearnerDecision; pending?: boolean }) {
  if (pending || !decision) {
    return <span className="drill-decision-mark drill-decision-mark--pending"><Clock3 aria-hidden="true" /><span>Decide</span></span>;
  }

  const Icon = decision === "allow" ? Check : decision === "review" ? MessageCircleQuestionMark : Ban;
  return <span className={`drill-decision-mark drill-decision-mark--${decision}`}><Icon aria-hidden="true" /><span>{decisionCopy[decision].label}</span></span>;
}

function TraceRow({ action, index, answer, current }: { action: DrillAction; index: number; answer?: DrillAnswer; current: boolean }) {
  const rowTime = action.at ?? `00:00:${String((index + 1) * 4).padStart(2, "0")}`;
  return (
    <li
      className={`drill-trace-row ${current ? "drill-trace-row--current" : ""} ${answer && !answer.correct ? "drill-trace-row--incorrect" : ""}`}
      aria-current={current ? "step" : undefined}
    >
      <span className="drill-trace-row__node" aria-hidden="true">
        {answer?.correct ? <Check /> : answer ? <X /> : <Clock3 />}
      </span>
      <time>{rowTime}</time>
      <span className="drill-tool-cell">
        <span className="drill-tool-token">{action.operation.slice(0, 4)}</span>
        <span><strong>{action.tool}</strong><small>{action.operation}</small></span>
      </span>
      <span className="drill-trace-row__target">{action.target ?? action.operation}</span>
      <span className="drill-trace-row__effect">{action.effect}</span>
      <DecisionMark decision={answer?.choice} pending={!answer} />
    </li>
  );
}

function OriginalTask({ scenario, onOpenModel }: { scenario: DrillScenario; onOpenModel: () => void }) {
  const context = Array.isArray(scenario.trustContext) ? scenario.trustContext : [scenario.trustContext];
  return (
    <aside className="drill-brief" aria-label="Scenario brief">
      <section>
        <div className="drill-section-title"><FileText aria-hidden="true" /><h2>Original task</h2></div>
        <blockquote>{scenario.learnerTask}</blockquote>
      </section>

      <section className="drill-boundary">
        <div className="drill-section-title"><Fingerprint aria-hidden="true" /><h2>Trust boundary</h2></div>
        <ol>
          <li><span className="drill-boundary__node drill-boundary__node--trusted">U</span><span><strong>User request</strong><small>direct authority</small></span></li>
          <li><span className="drill-boundary__node">A</span><span><strong>Agent plan</strong><small>proposal, not authority</small></span></li>
          <li><span className="drill-boundary__node drill-boundary__node--untrusted">T</span><span><strong>Tool content</strong><small>data, never instruction</small></span></li>
        </ol>
      </section>

      <section className="drill-context">
        <small>Scenario boundary</small>
        <ul>{context.map((item) => {
          const copy = typeof item === "string" ? item : item.note;
          const key = typeof item === "string" ? item : `${item.source}-${item.role}`;
          return <li key={key}>{copy}</li>;
        })}</ul>
      </section>

      <button className="text-button" onClick={onOpenModel}>Open mental model <ArrowRight aria-hidden="true" /></button>
    </aside>
  );
}

function Feedback({ scenario, action, answer, onNext, last }: { scenario: DrillScenario; action: DrillAction; answer: DrillAnswer; onNext: () => void; last: boolean }) {
  const expected = decisionCopy[action.correctDecision].label;
  const approvedHarm = action.harmful && answer.choice === "allow";

  return (
    <section className={`drill-feedback drill-feedback--${answer.correct ? "correct" : "incorrect"}`} aria-live="polite">
      <div className="drill-feedback__result">
        {answer.correct ? <CheckCircle2 aria-hidden="true" /> : <OctagonAlert aria-hidden="true" />}
        <div>
          <strong>{answer.correct ? "Sound decision" : `Expected decision: ${expected}`}</strong>
          <small>Your decision: {decisionCopy[answer.choice].label} in {formatTime(answer.decisionSeconds)}</small>
        </div>
      </div>

      <dl className="drill-feedback__facts">
        <div><dt>Original task</dt><dd>{scenario.learnerTask}</dd></div>
        <div><dt>Exact effect</dt><dd>{action.effect}</dd></div>
        <div><dt>Provenance</dt><dd><strong>{action.provenance.source}</strong><span>{trustLabel(action.provenance.trust)}</span></dd></div>
      </dl>

      <div className="drill-feedback__why">
        <strong>Why {expected}</strong>
        <p>{action.explanation}</p>
      </div>

      {approvedHarm && (
        <div className="drill-consequence" role="alert">
          <OctagonAlert aria-hidden="true" />
          <div><strong>Simulated consequence</strong><p>{simulatedConsequence(action.effect)} <b>No real action ran.</b></p></div>
        </div>
      )}

      {action.safeCounterfactual && (
        <div className="drill-counterfactual">
          <ShieldCheck aria-hidden="true" />
          <div><strong>What would change the decision</strong><p>{action.safeCounterfactual}</p></div>
        </div>
      )}

      <button className="button button--primary drill-next" onClick={onNext}>
        {last ? "See results" : "Next action"} <ArrowRight aria-hidden="true" />
      </button>
    </section>
  );
}

function DecisionPanel({
  scenario,
  action,
  answer,
  status,
  decisionSeconds,
  metrics,
  onChoose,
  onNext,
  onReplay,
}: {
  scenario: DrillScenario;
  action: DrillAction;
  answer?: DrillAnswer;
  status: DrillStatus;
  decisionSeconds: number;
  metrics: { score: number; correct: number; unsafeAllows: number; unnecessaryBlocks: number; attempted: number };
  onChoose: (choice: LearnerDecision) => void;
  onNext: () => void;
  onReplay: () => void;
}) {
  const last = scenario.actions.at(-1)?.id === action.id;

  if (status === "complete") {
    return (
      <aside className="drill-review" aria-label="Drill results">
        <section className="drill-complete" aria-live="polite">
          <span className="drill-complete__icon"><Target aria-hidden="true" /></span>
          <small>Practice complete</small>
          <h2>{metrics.score}% supervision score</h2>
          <p>{metrics.correct} of {metrics.attempted} correct. Unsafe allows: {metrics.unsafeAllows}. Unnecessary blocks: {metrics.unnecessaryBlocks}.</p>
          <button className="button button--primary" onClick={onReplay}><ListRestart aria-hidden="true" /> Replay drill</button>
        </section>
      </aside>
    );
  }

  if (status === "ended") {
    return (
      <aside className="drill-review" aria-label="Ended drill">
        <section className="drill-session-state">
          <Square aria-hidden="true" />
          <h2>Run ended</h2>
          <p>Your completed decisions remain in the trace.</p>
          <button className="button button--primary" onClick={onReplay}><RotateCcw aria-hidden="true" /> Start again</button>
        </section>
      </aside>
    );
  }

  return (
    <aside className="drill-review" aria-label="Current approval decision">
      <header className="drill-review__header">
        <div><h2>Inspect and decide</h2><p>Evaluate the literal effect, scope, and provenance.</p></div>
        <span className="drill-timer"><Timer aria-hidden="true" />{formatTime(answer?.decisionSeconds ?? decisionSeconds)}</span>
      </header>

      <section className="drill-current-call">
        <div className="drill-current-call__heading">
          <span className="drill-tool-token">{action.operation.slice(0, 4)}</span>
          <span><small>Current MCP request</small><code>{action.tool}</code></span>
          <span className={`drill-reversibility ${action.reversible ? "" : "drill-reversibility--final"}`}>{action.reversible ? "Reversible" : "Not reversible"}</span>
        </div>
        <dl>
          <div><dt>Target</dt><dd>{action.target ?? action.operation}</dd></div>
          <div><dt>Literal effect</dt><dd>{action.effect}</dd></div>
          <div><dt>Provenance</dt><dd><strong>{action.provenance.source}</strong><span>{trustLabel(action.provenance.trust)}</span></dd></div>
        </dl>
        <div className="drill-arguments"><small>Arguments</small><pre>{JSON.stringify(action.arguments, null, 2)}</pre></div>
      </section>

      {!answer && status === "paused" && (
        <section className="drill-session-state drill-session-state--inline" aria-live="polite">
          <Pause aria-hidden="true" /><h2>Drill paused</h2><p>The decision clock is stopped.</p>
        </section>
      )}

      {!answer && status === "running" && (
        <fieldset className="drill-choice-fieldset">
          <legend>Your decision</legend>
          <div className="drill-choice-group">
            <button className="drill-choice drill-choice--allow" onClick={() => onChoose("allow")}><Check aria-hidden="true" /><strong>Allow</strong><small>Proceed as proposed</small></button>
            <button className="drill-choice drill-choice--review" onClick={() => onChoose("review")}><MessageCircleQuestionMark aria-hidden="true" /><strong>Ask</strong><small>Request missing scope</small></button>
            <button className="drill-choice drill-choice--block" onClick={() => onChoose("block")}><Ban aria-hidden="true" /><strong>Block</strong><small>Prevent this effect</small></button>
          </div>
        </fieldset>
      )}

      {answer && <Feedback scenario={scenario} action={action} answer={answer} onNext={onNext} last={last} />}
    </aside>
  );
}

export function LiveRunPage({ notify, onOpenModel }: LiveRunPageProps) {
  const scenario = getSelectedScenario();
  const drill = useApprovalDrill(scenario);
  const visibleActions = scenario.actions.slice(0, drill.currentIndex + 1);
  const queuedCount = Math.max(0, scenario.actions.length - visibleActions.length);
  const statusClass = drill.status === "paused" ? "status-indicator--paused" : drill.status === "ended" || drill.status === "complete" ? "status-indicator--ended" : "";

  const choose = (choice: LearnerDecision) => {
    drill.choose(choice);
    notify(`${decisionCopy[choice].label} recorded. Feedback is ready.`);
  };

  const next = () => {
    const finishing = drill.currentIndex === scenario.actions.length - 1;
    drill.next();
    if (finishing) notify("Drill complete. Practice signals updated.");
  };

  const replay = () => {
    drill.replay();
    notify("Drill restarted");
  };

  return (
    <div className="page page--drill">
      <header className="page-header drill-page-header">
        <div>
          <p className="drill-page-header__kicker">Education practice</p>
          <h1>{scenario.title} - supervision drill</h1>
          <p className="drill-page-header__tagline">Practice supervising AI agents before the stakes are real.</p>
        </div>
        <div className="header-actions drill-header-actions">
          <span className={`status-indicator ${statusClass}`}><span className="status-dot" />{statusCopy[drill.status]}</span>
          <button className="button button--secondary" onClick={drill.togglePause} disabled={drill.status === "ended" || drill.status === "complete" || Boolean(drill.currentAnswer)}>
            {drill.status === "paused" ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />} {drill.status === "paused" ? "Resume" : "Pause"}
          </button>
          <button className="button button--secondary" onClick={drill.end} disabled={drill.status === "ended" || drill.status === "complete"}><Square aria-hidden="true" /> End</button>
          <button className="icon-button" onClick={replay} title="Restart drill" aria-label="Restart drill"><RotateCcw aria-hidden="true" /></button>
        </div>
      </header>

      <section className="drill-metrics" aria-label="Practice signals">
        <div><TerminalSquare aria-hidden="true" /><span><strong>{Math.min(drill.currentIndex + 1, scenario.actions.length)}/{scenario.actions.length}</strong><small>question</small></span></div>
        <div><CheckCircle2 aria-hidden="true" /><span><strong>{drill.metrics.correct}</strong><small>correct</small></span></div>
        <div><OctagonAlert aria-hidden="true" /><span><strong>{drill.metrics.unsafeAllows}</strong><small>unsafe allows</small></span></div>
        <div><Ban aria-hidden="true" /><span><strong>{drill.metrics.unnecessaryBlocks}</strong><small>unnecessary blocks</small></span></div>
      </section>

      <div className="drill-layout">
        <OriginalTask scenario={scenario} onOpenModel={onOpenModel} />

        <section className="drill-trace" aria-labelledby="drill-trace-title">
          <header className="drill-trace__title"><div><TerminalSquare aria-hidden="true" /><h2 id="drill-trace-title">MCP trace</h2></div><code>{scenario.id}</code></header>
          <div className="drill-trace__head" aria-hidden="true"><span>Time</span><span>Tool / action</span><span>Target</span><span>Literal effect</span><span>Decision</span></div>
          <ol className="drill-trace__rows">
            {visibleActions.map((action, index) => <TraceRow key={action.id} action={action} index={index} answer={drill.answers[action.id]} current={index === drill.currentIndex} />)}
          </ol>
          {queuedCount > 0 && <div className="drill-queue"><Clock3 aria-hidden="true" /><span>{queuedCount} action{queuedCount === 1 ? "" : "s"} queued after this approval</span></div>}
        </section>

        <DecisionPanel
          scenario={scenario}
          action={drill.currentAction}
          answer={drill.currentAnswer}
          status={drill.status}
          decisionSeconds={drill.decisionSeconds}
          metrics={drill.metrics}
          onChoose={choose}
          onNext={next}
          onReplay={replay}
        />
      </div>
    </div>
  );
}
