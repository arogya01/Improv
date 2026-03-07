import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./MarketingShell.css";

export const MarketingShell: React.FC = () => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="marketing-shell">
      <header
        className={`marketing-header ${compact ? "marketing-header--compact" : ""}`}
      >
        <Link to="/" className="marketing-title">
          Improv
        </Link>

        <nav className="marketing-nav" aria-label="Landing page sections">
          <a className="marketing-link" href="#workflow">
            Workflow
          </a>
          <a className="marketing-link" href="#archive">
            Archive
          </a>
          <a className="marketing-link" href="#system">
            System
          </a>
        </nav>

        <div className="marketing-actions">
          <Link className="marketing-secondary" to="/library">
            Library
          </Link>
          <a className="marketing-primary" href="#launch">
            Start Practicing
          </a>
        </div>
      </header>

      <main className="marketing-content">
        <Outlet />
      </main>
    </div>
  );
};
