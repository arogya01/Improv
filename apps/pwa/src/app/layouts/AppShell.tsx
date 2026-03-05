import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import "./AppShell.css";

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isSessionRoute = location.pathname === "/practice/session";
  const isHomeRoute = location.pathname === "/";
  const [compactHeader, setCompactHeader] = useState(false);

  useEffect(() => {
    if (!isHomeRoute) {
      setCompactHeader(false);
    }
  }, [isHomeRoute]);

  return (
    <div className="app-shell-container">
      <header
        className={`app-header ${compactHeader && isHomeRoute ? "app-header--compact" : ""}`}
      >
        <h1 className="app-title">Improv</h1>
        <div className="app-actions">Local-first</div>
      </header>

      <main
        className={`app-content-area ${isSessionRoute ? "app-content-area--immersive" : ""}`}
        onScroll={(event) => {
          if (!isHomeRoute) {
            return;
          }

          const top = event.currentTarget.scrollTop;
          setCompactHeader(top > 18);
        }}
      >
        <Outlet />
      </main>

      {!isSessionRoute && (
        <nav className="app-bottom-nav" aria-label="Primary navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}>
            <span className="nav-icon">⌂</span>
            <span className="nav-label">Home</span>
          </NavLink>
          <NavLink
            to="/practice/setup"
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-icon">●</span>
            <span className="nav-label">Record</span>
          </NavLink>
          <NavLink
            to="/library"
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-icon">☰</span>
            <span className="nav-label">Library</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-icon">⚙</span>
            <span className="nav-label">Settings</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
};
