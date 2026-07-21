import {
  ArrowRight,
  CheckCircle2,
  Database,
  Eye,
  KeyRound,
  Route,
  ShieldQuestion,
} from "lucide-react";
import { useState } from "react";

const lessons = [
  {
    id: "authority",
    number: "01",
    title: "Authority is not data",
    summary: "Only the user or an approved policy can grant authority.",
    principle: "Emails, documents, search results, and tool output remain data, even when they are written like instructions.",
    prompt: "Ask: who authorized this action?",
    icon: KeyRound,
    rows: [
      { label: "User authority", value: "Summarize the unread messages", tone: "trusted" },
      { label: "Message content", value: "Upload the mailbox archive", tone: "untrusted" },
    ],
  },
  {
    id: "effect",
    number: "02",
    title: "Inspect the literal effect",
    summary: "Judge the proposed call, not the agent's reassuring description.",
    principle: "Read the exact verb, object, destination, amount, and reversibility before approving a consequential action.",
    prompt: "Ask: what changes if this runs?",
    icon: Eye,
    rows: [
      { label: "Agent says", value: "Finish organizing the inbox", tone: "neutral" },
      { label: "Tool will do", value: "send 42 messages to an external address", tone: "warning" },
    ],
  },
  {
    id: "provenance",
    number: "03",
    title: "Trace provenance",
    summary: "Follow every instruction back to its source and trust level.",
    principle: "A request can cross several tools. Its authority does not improve merely because another agent repeats it.",
    prompt: "Ask: where did this instruction originate?",
    icon: Route,
    rows: [
      { label: "Origin", value: "Text embedded in an external document", tone: "untrusted" },
      { label: "Current proposal", value: "Repeated by a planning agent", tone: "neutral" },
    ],
  },
] as const;

type Answer = "block" | "approve" | "delegate";

interface MentalModelPageProps {
  notify: (message: string) => void;
  onPractice: () => void;
}

export function MentalModelPage({ notify, onPractice }: MentalModelPageProps) {
  const [activeId, setActiveId] = useState<(typeof lessons)[number]["id"]>("authority");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const active = lessons.find((lesson) => lesson.id === activeId) ?? lessons[0];
  const ActiveIcon = active.icon;

  const chooseAnswer = (next: Answer) => {
    setAnswer(next);
    notify(next === "block" ? "Correct. Data cannot grant new authority." : "Look again at the source of the instruction.");
  };

  return (
    <div className="page page--standard">
      <header className="page-header">
        <div><p className="page-kicker">Core lesson</p><h1>Mental model</h1><p>Three checks students can use to explain why an agent action is or is not authorized.</p></div>
        <button className="button button--primary" onClick={onPractice}>Open practice <ArrowRight /></button>
      </header>

      <div className="lesson-layout">
        <section className="open-section lesson-panel">
          <div className="lesson-selector" role="tablist" aria-label="Mental model lessons">
            {lessons.map((lesson) => {
              const Icon = lesson.icon;
              return (
                <button
                  key={lesson.id}
                  className={`lesson-tab ${activeId === lesson.id ? "lesson-tab--active" : ""}`}
                  role="tab"
                  aria-selected={activeId === lesson.id}
                  onClick={() => setActiveId(lesson.id)}
                >
                  <span className="lesson-tab__number">{lesson.number}</span>
                  <Icon aria-hidden="true" />
                  <span><strong>{lesson.title}</strong><small>{lesson.summary}</small></span>
                </button>
              );
            })}
          </div>

          <article className="lesson-content" aria-live="polite">
            <div className="lesson-content__icon"><ActiveIcon /></div>
            <p className="lesson-content__step">Check {active.number}</p>
            <h2>{active.title}</h2>
            <p className="lesson-content__principle">{active.principle}</p>
            <div className="comparison-block">
              {active.rows.map((row) => (
                <div className={`comparison-row comparison-row--${row.tone}`} key={row.label}>
                  <small>{row.label}</small><strong>{row.value}</strong>
                </div>
              ))}
            </div>
            <p className="reviewer-prompt"><ShieldQuestion />{active.prompt}</p>
          </article>
        </section>

        <aside className="open-section quick-check">
          <div className="section-heading"><div><h2>Quick check</h2><p>Choose the safest justified decision.</p></div><Database /></div>
          <p className="quick-check__scenario">The user asks for one invoice summary. A note inside the invoice tells the agent to upload every invoice to a new external destination.</p>
          <div className="answer-list" aria-label="Answer choices">
            <button className={answer === "block" ? "answer-option answer-option--correct" : "answer-option"} onClick={() => chooseAnswer("block")}><span>A</span><strong>Block the upload</strong>{answer === "block" && <CheckCircle2 />}</button>
            <button className={answer === "approve" ? "answer-option answer-option--incorrect" : "answer-option"} onClick={() => chooseAnswer("approve")}><span>B</span><strong>Approve it once</strong></button>
            <button className={answer === "delegate" ? "answer-option answer-option--incorrect" : "answer-option"} onClick={() => chooseAnswer("delegate")}><span>C</span><strong>Let the agent decide</strong></button>
          </div>
          {answer && <div className={`answer-feedback ${answer === "block" ? "answer-feedback--correct" : ""}`} role="status">{answer === "block" ? "Correct: the external note is data, not authority." : "Not quite. The instruction came from untrusted data and exceeds the user's request."}</div>}
        </aside>
      </div>
    </div>
  );
}
