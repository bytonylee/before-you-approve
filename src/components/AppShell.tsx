import {
  Brain,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Library,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";

export type AppView = "practice" | "model" | "progress" | "cases";

const navItems = [
  { id: "practice", label: "Practice", icon: PlayCircle },
  { id: "model", label: "Mental model", icon: Brain },
  { id: "progress", label: "Progress", icon: ChartNoAxesColumnIncreasing },
  { id: "cases", label: "Case library", icon: Library },
] satisfies Array<{ id: AppView; label: string; icon: typeof PlayCircle }>;

interface AppShellProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  children: ReactNode;
}

export function AppShell({ view, onViewChange, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 960px)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 960px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setMobileViewport(event.matches);
      if (!event.matches) setMobileOpen(false);
    };

    setMobileViewport(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const selectView = (next: AppView) => {
    onViewChange(next);
    setMobileOpen(false);
  };

  return (
    <div className="app-shell">
      <button
        className="mobile-menu icon-button"
        type="button"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        aria-controls="primary-navigation"
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>
      <aside
        id="primary-navigation"
        className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}
        aria-hidden={mobileViewport && !mobileOpen ? true : undefined}
        inert={mobileViewport && !mobileOpen ? true : undefined}
      >
        <div className="sidebar__top">
          <BrandMark />
          <nav aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${view === item.id ? "nav-item--active" : ""}`}
                  aria-current={view === item.id ? "page" : undefined}
                  onClick={() => selectView(item.id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="sidebar__bottom">
          <div className="training-workspace">
            <GraduationCap aria-hidden="true" />
            <span><strong>Demo workspace</strong><small>Reviewer training</small></span>
          </div>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <main className="main-content">{children}</main>
    </div>
  );
}
