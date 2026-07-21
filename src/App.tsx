import { useEffect, useState } from "react";
import { AppShell, type AppView } from "./components/AppShell";
import { CaseLibraryPage, type CaseId } from "./pages/CaseLibraryPage";
import { LiveRunPage } from "./pages/LiveRunPage";
import { MentalModelPage } from "./pages/MentalModelPage";
import { ProgressPage } from "./pages/ProgressPage";

function getInitialView(): AppView {
  const hash = window.location.hash.replace("#", "");
  const legacyViews: Record<string, AppView> = {
    live: "practice",
    policies: "model",
    receipts: "progress",
    integrations: "cases",
  };

  if (["practice", "model", "progress", "cases"].includes(hash)) return hash as AppView;
  return legacyViews[hash] ?? "practice";
}

export default function App() {
  const [view, setView] = useState<AppView>(getInitialView);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    window.location.hash = view;
  }, [view]);

  useEffect(() => {
    const handleHashChange = () => setView(getInitialView());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const startCase = (caseId: CaseId, title: string) => {
    window.localStorage.setItem("before-you-approve:selected-case", caseId);
    setToast(`${title} selected. Opening practice.`);
    setView("practice");
  };

  return (
    <AppShell view={view} onViewChange={setView}>
      {view === "practice" && <LiveRunPage notify={setToast} onOpenModel={() => setView("model")} />}
      {view === "model" && <MentalModelPage notify={setToast} onPractice={() => setView("practice")} />}
      {view === "progress" && <ProgressPage notify={setToast} onPractice={() => setView("practice")} />}
      {view === "cases" && <CaseLibraryPage notify={setToast} onStartCase={startCase} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </AppShell>
  );
}
