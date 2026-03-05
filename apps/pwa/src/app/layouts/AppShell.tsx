import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import "./AppShell.css";

export const AppShell: React.FC = () => {
  return (
    <div className="app-shell-container">
      <header className="app-header">
        <h1 className="app-title">Improv</h1>
        <div className="app-actions">{/* Contextual actions go here */}</div>
      </header>

      <main className="app-content-area">
        <Outlet />
      </main>

      <nav className="app-bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? "nav-item--active" : ""}`
          }
        >
          <span className="nav-icon">⌂</span>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink
          to="/practice/setup"
          className={({ isActive }) =>
            `nav-item ${isActive ? "nav-item--active" : ""}`
          }
        >
          <span className="nav-icon">●</span>
          <span className="nav-label">Record</span>
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            `nav-item ${isActive ? "nav-item--active" : ""}`
          }
        >
          <span className="nav-icon">☰</span>
          <span className="nav-label">Library</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "nav-item--active" : ""}`
          }
        >
          <span className="nav-icon">⚙</span>
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};
