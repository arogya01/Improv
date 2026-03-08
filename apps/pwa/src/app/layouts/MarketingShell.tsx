import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { cn } from "../../lib/utils";

export const MarketingShell: React.FC = () => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-transparent font-ui text-ink-900">
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center justify-center gap-6 px-6 bg-[color-mix(in_srgb,var(--surface-muted)_90%,transparent)] border-b border-[var(--line-soft)] backdrop-blur-[32px] transition-all duration-300 ease-out",
          compact ? "h-[72px] shadow-ethereal" : "h-[82px]",
        )}
      >
        <Link
          to="/"
          className="font-headline text-[1.7rem] font-semibold tracking-tighter text-ink-900 no-underline mr-auto"
        >
          Improv
        </Link>

        <nav
          className="flex items-center gap-5 max-[920px]:hidden"
          aria-label="Landing page sections"
        >
          <a
            className="text-ink-700 text-[0.95rem] font-medium no-underline transition-colors duration-300 hover:text-ink-900"
            href="#workflow"
          >
            Workflow
          </a>
          <a
            className="text-ink-700 text-[0.95rem] font-medium no-underline transition-colors duration-300 hover:text-ink-900"
            href="#archive"
          >
            Archive
          </a>
          <a
            className="text-ink-700 text-[0.95rem] font-medium no-underline transition-colors duration-300 hover:text-ink-900"
            href="#system"
          >
            System
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3 max-[920px]:ml-0">
          <Link
            className="text-ink-700 text-[0.95rem] font-medium no-underline transition-colors duration-300 hover:text-ink-900 max-[920px]:hidden"
            to="/library"
          >
            Library
          </Link>
          <a
            className="py-3 px-4 max-[560px]:px-3.5 max-[560px]:text-[0.85rem] rounded-full bg-gradient-to-r from-teal-50/80 to-indigo-50/80 border border-teal-200/50 text-teal-900 text-[0.92rem] font-medium shadow-ethereal no-underline transition-all duration-300 hover:-translate-y-px hover:from-teal-50 hover:to-indigo-50 hover:border-teal-300/60"
            href="#launch"
          >
            Start Practicing
          </a>
        </div>
      </header>

      <main className="flex-1 relative">
        <Outlet />
      </main>
    </div>
  );
};
