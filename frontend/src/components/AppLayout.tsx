import {
  ArchiveRestore,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Sprout,
  Trees,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/resurrect", label: "Resurrect", icon: ArchiveRestore },
  { to: "/graveyard", label: "Graveyard", icon: Trees },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label="Project Graveyard home">
          <span className="brand-mark"><Sprout size={19} strokeWidth={2.2} /></span>
          <span><strong>Project</strong><em>Graveyard</em></span>
        </NavLink>

        <nav className="main-nav" aria-label="Primary navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink className="button button-primary sidebar-action" to="/projects/new">
          <Plus size={17} />
          New project
        </NavLink>

        <p className="sidebar-note">Keep the good ideas close.<br />Let the rest rest.</p>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <NavLink className="brand" to="/">
            <span className="brand-mark"><Sprout size={18} /></span>
            <strong>Project Graveyard</strong>
          </NavLink>
          <NavLink className="icon-button" to="/projects/new" aria-label="Create a project">
            <Plus size={20} />
          </NavLink>
        </header>
        <div className="page-wrap">
          <Outlet />
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "mobile-nav-item active" : "mobile-nav-item")}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

