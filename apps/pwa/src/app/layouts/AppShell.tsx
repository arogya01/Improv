import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

export const AppShell: React.FC = () => {
  const location = useLocation();
  const isSessionRoute = location.pathname === "/practice/session";

  return (
    <div
      className={cn("flex flex-col h-dvh bg-transparent font-ui text-ink-900")}
    >
      <main
        className={cn(
          "flex-1 overflow-y-auto relative scroll-smooth",
          !isSessionRoute && "pb-[88px]",
        )}
      >
        <Outlet />
      </main>

      {!isSessionRoute && (
        <nav
          className="fixed inset-x-6 max-[560px]:inset-x-3 bottom-4 max-[560px]:bottom-3 h-16 pb-[env(safe-area-inset-bottom)] flex items-stretch justify-around border border-white/60 rounded-full bg-white/55 backdrop-blur-[32px] shadow-ethereal-lg z-40"
          aria-label="Primary navigation"
        >
          <NavLink
            to="/"
            end
            viewTransition
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-1 no-underline font-ui transition-colors duration-300",
                isActive ? "text-teal-700" : "text-ink-400",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "text-[0.6rem] transition-transform duration-300",
                    isActive && "text-teal-500 scale-[1.3]",
                  )}
                  aria-hidden="true"
                >
                  ●
                </span>
                <span className="text-[0.68rem] font-medium tracking-wide">
                  Practice
                </span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/library"
            viewTransition
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-1 no-underline font-ui transition-colors duration-300",
                isActive ? "text-teal-700" : "text-ink-400",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "text-[0.6rem] transition-transform duration-300",
                    isActive && "text-teal-500 scale-[1.3]",
                  )}
                  aria-hidden="true"
                >
                  ▪
                </span>
                <span className="text-[0.68rem] font-medium tracking-wide">
                  Archive
                </span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/settings"
            viewTransition
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-1 no-underline font-ui transition-colors duration-300",
                isActive ? "text-teal-700" : "text-ink-400",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "text-[0.6rem] transition-transform duration-300",
                    isActive && "text-teal-500 scale-[1.3]",
                  )}
                  aria-hidden="true"
                >
                  ◦
                </span>
                <span className="text-[0.68rem] font-medium tracking-wide">
                  Settings
                </span>
              </>
            )}
          </NavLink>
        </nav>
      )}
    </div>
  );
};
