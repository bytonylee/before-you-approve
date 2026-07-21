import { ArrowRight, BarChart3, CheckCircle2, RotateCcw, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";

const skills = [
  { id: "authority", label: "Authority boundaries", score: 75, correct: "3 of 4", note: "You consistently separate user requests from instructions found inside content." },
  { id: "effects", label: "Literal effects", score: 83, correct: "5 of 6", note: "Strong work reading the real tool effect. Recheck destination changes before approval." },
  { id: "provenance", label: "Provenance", score: 67, correct: "2 of 3", note: "Trace repeated instructions back one more step when several agents or tools are involved." },
] as const;

const drills = [
  { id: "demo-01", title: "Inbox injection", result: "4 / 4", missed: 0, focus: "Authority vs data", label: "Demo drill 01" },
  { id: "demo-02", title: "Purchase limit", result: "3 / 4", missed: 1, focus: "Literal effect", label: "Demo drill 02" },
  { id: "demo-03", title: "Repository cleanup", result: "2 / 4", missed: 2, focus: "Provenance", label: "Demo drill 03" },
] as const;

type DrillFilter = "all" | "review";

interface ProgressPageProps {
  notify: (message: string) => void;
  onPractice: () => void;
}

export function ProgressPage({ notify, onPractice }: ProgressPageProps) {
  const [selectedSkill, setSelectedSkill] = useState<(typeof skills)[number]["id"]>("authority");
  const [filter, setFilter] = useState<DrillFilter>("all");
  const [selectedDrill, setSelectedDrill] = useState<(typeof drills)[number]["id"]>("demo-02");
  const skill = skills.find((item) => item.id === selectedSkill) ?? skills[0];
  const visibleDrills = useMemo(() => filter === "review" ? drills.filter((drill) => drill.missed > 0) : drills, [filter]);
  const drill = drills.find((item) => item.id === selectedDrill) ?? drills[1];

  const showReview = () => {
    setFilter("review");
    setSelectedDrill("demo-02");
    notify("Showing decisions to revisit from the demo drills");
  };

  return (
    <div className="page page--standard">
      <header className="page-header">
        <div><p className="page-kicker">Practice signals</p><h1>Progress</h1><p>Preview how learners and educators can spot review habits that need another pass.</p></div>
        <button className="button button--primary" onClick={onPractice}>Practice again <ArrowRight /></button>
      </header>

      <section className="demo-disclosure">
        <Sparkles /><p><strong>Demonstration data</strong><span>These local, seeded results come from three fictional drills. They do not represent your activity.</span></p>
      </section>

      <div className="mastery-layout">
        <section className="open-section progress-overview">
          <div className="progress-score"><small>Demo accuracy</small><strong>75%</strong><span>9 of 12 decisions</span></div>
          <div className="progress-stat"><CheckCircle2 /><span><strong>3</strong><small>Drills completed</small></span></div>
          <div className="progress-stat"><Target /><span><strong>3</strong><small>Decisions to revisit</small></span></div>
          <button className="button button--secondary" onClick={showReview}>Review misses</button>
        </section>

        <section className="open-section mastery-panel">
          <div className="section-heading"><div><h2>Practice signal by skill</h2><p>Prototype signals based only on the seeded demo drills.</p></div><BarChart3 /></div>
          <div className="skill-list">
            {skills.map((item) => (
              <button className={`skill-row ${selectedSkill === item.id ? "skill-row--selected" : ""}`} key={item.id} onClick={() => setSelectedSkill(item.id)} aria-pressed={selectedSkill === item.id}>
                <span><strong>{item.label}</strong><small>{item.correct} correct</small></span>
                <span className="mastery-bar" aria-label={`${item.score} percent`}><span style={{ width: `${item.score}%` }} /></span>
                <strong>{item.score}%</strong>
              </button>
            ))}
          </div>
          <div className="skill-detail" aria-live="polite"><strong>{skill.label}</strong><p>{skill.note}</p></div>
        </section>
      </div>

      <section className="open-section drill-history">
        <div className="section-heading">
          <div><h2>Demo drill history</h2><p>Seeded examples for previewing the learning experience.</p></div>
          <div className="segmented-control" aria-label="Filter drill history">
            <button className={filter === "all" ? "segmented-control__active" : ""} onClick={() => setFilter("all")}>All drills</button>
            <button className={filter === "review" ? "segmented-control__active" : ""} onClick={showReview}>Needs review</button>
          </div>
        </div>
        <div className="drill-table" aria-label="Demo drill results">
          <div className="drill-table__head"><span>Case</span><span>Attempt</span><span>Focus</span><span>Result</span></div>
          {visibleDrills.map((item) => (
            <button className={`drill-row ${selectedDrill === item.id ? "drill-row--selected" : ""}`} key={item.id} onClick={() => setSelectedDrill(item.id)}>
              <strong>{item.title}</strong><span>{item.label}</span><span>{item.focus}</span><span>{item.result}</span>
            </button>
          ))}
        </div>
        <div className="drill-review-note" aria-live="polite"><RotateCcw /><p><strong>{drill.title}</strong><span>{drill.missed === 0 ? "No missed decisions in this demo attempt." : `${drill.missed} demo decision${drill.missed > 1 ? "s" : ""} marked for review. Focus next on ${drill.focus.toLowerCase()}.`}</span></p></div>
      </section>
    </div>
  );
}
