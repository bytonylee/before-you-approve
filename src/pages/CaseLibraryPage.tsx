import { ArrowRight, ChevronRight, FolderGit2, MailWarning, ShoppingCart, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export type CaseId = "inbox-injection" | "purchase-limit" | "repository-cleanup";
type Difficulty = "Foundation" | "Intermediate" | "Advanced";
type CaseFilter = "All" | Difficulty;

const cases = [
  {
    id: "inbox-injection" as const,
    title: "Inbox injection",
    difficulty: "Intermediate" as const,
    summary: "A summarization task encounters an instruction hidden inside message content.",
    skills: ["Authority vs data", "Provenance"],
    decisions: 4,
    duration: "About 3 min",
    goal: "Identify the moment untrusted content attempts to expand the user's request.",
    watch: "Treat every message body as data, even when it uses urgent or authoritative language.",
    icon: MailWarning,
  },
  {
    id: "purchase-limit" as const,
    title: "Purchase limit",
    difficulty: "Foundation" as const,
    summary: "A delegated purchase stays within category but quietly exceeds the approved amount.",
    skills: ["Literal effect", "Scope limits"],
    decisions: 4,
    duration: "About 3 min",
    goal: "Compare the exact total, merchant, and item against the user's delegated authority.",
    watch: "Check fees, quantity changes, and substitutions before relying on the displayed subtotal.",
    icon: ShoppingCart,
  },
  {
    id: "repository-cleanup" as const,
    title: "Repository cleanup",
    difficulty: "Advanced" as const,
    summary: "A maintenance request grows from reversible cleanup into destructive changes.",
    skills: ["Irreversibility", "Provenance", "Scope drift"],
    decisions: 4,
    duration: "About 3 min",
    goal: "Separate reversible housekeeping from deletions that require explicit confirmation.",
    watch: "Inspect targets literally and distinguish generated artifacts from source or history.",
    icon: FolderGit2,
  },
];

interface CaseLibraryPageProps {
  notify: (message: string) => void;
  onStartCase: (caseId: CaseId, title: string) => void;
}

export function CaseLibraryPage({ notify, onStartCase }: CaseLibraryPageProps) {
  const [filter, setFilter] = useState<CaseFilter>("All");
  const [selectedId, setSelectedId] = useState<CaseId>("inbox-injection");
  const visibleCases = useMemo(() => filter === "All" ? cases : cases.filter((item) => item.difficulty === filter), [filter]);
  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];
  const SelectedIcon = selected.icon;

  const selectFilter = (next: CaseFilter) => {
    setFilter(next);
    const firstMatch = next === "All" ? cases[0] : cases.find((item) => item.difficulty === next);
    if (firstMatch) setSelectedId(firstMatch.id);
  };

  const selectCase = (caseId: CaseId, title: string) => {
    setSelectedId(caseId);
    notify(`${title} preview selected`);
  };

  return (
    <div className="page page--standard">
      <header className="page-header">
        <div><p className="page-kicker">Scenario practice</p><h1>Case library</h1><p>Train on realistic approval moments without causing real-world effects.</p></div>
      </header>

      <section className="case-toolbar" aria-label="Case filters">
        <div><SlidersHorizontal /><strong>Difficulty</strong></div>
        <div className="segmented-control">
          {(["All", "Foundation", "Intermediate", "Advanced"] as const).map((item) => <button key={item} className={filter === item ? "segmented-control__active" : ""} onClick={() => selectFilter(item)}>{item}</button>)}
        </div>
      </section>

      <div className="case-library-layout">
        <section className="open-section case-list" aria-label="Training cases">
          {visibleCases.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`case-row ${selectedId === item.id ? "case-row--selected" : ""}`} key={item.id} onClick={() => selectCase(item.id, item.title)} aria-pressed={selectedId === item.id}>
                <span className="case-icon"><Icon /></span>
                <span className="case-row__copy"><span><strong>{item.title}</strong><small className={`difficulty-label difficulty-label--${item.difficulty.toLowerCase()}`}>{item.difficulty}</small></span><small>{item.summary}</small><span className="skill-tags">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</span></span>
                <ChevronRight />
              </button>
            );
          })}
        </section>

        <aside className="open-section case-preview" aria-live="polite">
          <div className="case-preview__heading"><span className="case-icon case-icon--large"><SelectedIcon /></span><span><small>{selected.difficulty} case</small><h2>{selected.title}</h2></span></div>
          <p>{selected.summary}</p>
          <dl className="case-facts"><div><dt>Decisions</dt><dd>{selected.decisions}</dd></div><div><dt>Typical pace</dt><dd>{selected.duration}</dd></div></dl>
          <section><small>Learning goal</small><p>{selected.goal}</p></section>
          <section><small>What to watch</small><p>{selected.watch}</p></section>
          <div className="case-preview__skills"><small>Skills</small><span className="skill-tags">{selected.skills.map((skill) => <span key={skill}>{skill}</span>)}</span></div>
          <button className="button button--primary" onClick={() => onStartCase(selected.id, selected.title)}>Start drill <ArrowRight /></button>
        </aside>
      </div>
    </div>
  );
}
