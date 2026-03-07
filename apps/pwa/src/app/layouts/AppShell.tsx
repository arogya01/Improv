import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "./AppShell.css";

type RouteMeta = {
  kicker: string;
  label: string;
};

function getRouteMeta(pathname: string): RouteMeta {
  if (pathname.startsWith("/practice/setup")) {
    return { kicker: "Preflight", label: "Setup" };
  }

  if (pathname.startsWith("/practice/session")) {
    return { kicker: "Live", label: "Session" };
  }

  if (pathname.startsWith("/library/")) {
    return { kicker: "Archive", label: "Session Detail" };
  }

  if (pathname.startsWith("/library")) {
    return { kicker: "Archive", label: "Library" };
  }

  if (pathname.startsWith("/settings")) {
    return { kicker: "System", label: "Settings" };
  }

  return { kicker: "Studio", label: "Improv" };
}

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isSessionRoute = location.pathname === "/practice/session";
  const routeMeta = getRouteMeta(location.pathname);

  return (
    <div className={`app-shell-container ${isSessionRoute ? "app-shell-container--immersive" : ""}`}>
      {!isSessionRoute && (
        <header className="app-header">
          <Link to="/" className="app-brand">
            Improv
          </Link>

          <div className="app-header-copy">
            <span className="app-header-kicker">{routeMeta.kicker}</span>
            <span className="app-header-label">{routeMeta.label}</span>
          </div>
        </header>
      )}

      <main className={`app-content-area ${isSessionRoute ? "app-content-area--immersive" : ""}`}>
        <Outlet />
      </main>

      {!isSessionRoute && (
        <nav className="app-bottom-nav" aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}>
            <span className="nav-mark" aria-hidden="true" />
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink
            to="/practice/setup"
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-mark" aria-hidden="true" />
            <span className="nav-label">Record</span>
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-mark" aria-hidden="true" />
            <span className="nav-label">Library</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-mark" aria-hidden="true" />
            <span className="nav-label">Settings</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
};
