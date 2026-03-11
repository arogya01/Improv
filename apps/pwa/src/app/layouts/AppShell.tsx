import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Mic2, Library, Settings } from "lucide-react";
import { cn } from "../../lib/utils";

// --- Motion Tokens & Philosophy (from Design System) ---
const motionTokens = {
  duration: {
    fast: 0.3,
    base: 0.6,
    slow: 0.9,
    ambient: 20,
  },
  ease: {
    premium: [0.16, 1, 0.3, 1] as const,
  },
  spring: {
    gentle: { type: "spring", stiffness: 300, damping: 30 },
  },
} as const;

// Extracted aesthetic noise background pattern
const bgNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E")`;

export const AppShell: React.FC = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isSessionRoute = location.pathname === "/app/practice/session";

  // TODO: Replace with actual state selector when wiring up the store
  const isRecording = false;

  return (
    <div
      className={cn(
        "flex flex-col h-dvh font-ui text-gray-900 relative overflow-hidden",
        "bg-[#FDFCF8] selection:bg-stone-200 selection:text-stone-900",
      )}
      style={{ backgroundImage: bgNoise }}
    >
      {/* Subtle Background Glows */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: motionTokens.duration.ambient * 2,
              ease: "linear",
            }}
            className="absolute w-[40rem] h-[40rem] -top-40 -right-20 bg-gray-200/40 rounded-full mix-blend-multiply blur-3xl opacity-50"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: motionTokens.duration.ambient * 2.5,
              ease: "linear",
            }}
            className="absolute w-[30rem] h-[30rem] -bottom-40 -left-20 bg-stone-200/40 rounded-full mix-blend-multiply blur-3xl opacity-50"
          />
        </div>
      )}

      {/* Recording Badge */}
      {!isSessionRoute && isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.base,
            ease: motionTokens.ease.premium,
          }}
          style={{ top: 16, left: 0, right: 0 }}
          className="absolute flex justify-center z-50 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-full px-4 py-1.5 pointer-events-auto">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Recording
            </div>
          </div>
        </motion.div>
      )}

      <main
        className={cn(
          "flex-1 overflow-y-auto relative scroll-smooth z-10",
          !isSessionRoute && "pb-[100px]", // extra padding for bottom sheet
        )}
      >
        <div className="w-full mx-auto h-full pt-16">
          <Outlet />
        </div>
      </main>

      {!isSessionRoute && (
        <motion.nav
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: motionTokens.duration.slow,
            ease: motionTokens.ease.premium,
            delay: 0.1,
          }}
          style={{ bottom: 0, left: 0, right: 0 }}
          className={cn(
            "absolute pb-[env(safe-area-inset-bottom)] w-full h-[88px]",
            "flex items-stretch justify-around px-4 sm:px-6",
            "bg-white/80 backdrop-blur-xl border-t border-gray-200",
            "rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-40 transition-all duration-500 ease-out",
          )}
          aria-label="Primary navigation"
        >
            { to: "/app", label: "Practice", icon: Mic2, isEnd: true },
            {
              to: "/app/archive",
              label: "Archive",
              icon: Library,
              isEnd: false,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.isEnd}
                viewTransition
                className="relative flex-1 flex flex-col items-center justify-center no-underline font-ui group outline-none"
              >
                {({ isActive }) => (
                  <>
                    {/* Animated Background Pill */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-x-2 inset-y-3 bg-gray-100 rounded-2xl -z-10"
                        initial={false}
                        transition={motionTokens.spring.gentle}
                      />
                    )}

                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      transition={motionTokens.spring.gentle}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 transition-colors duration-300",
                        isActive
                          ? "text-gray-900"
                          : "text-gray-400 group-hover:text-gray-600",
                        "pt-1",
                      )}
                    >
                      <div
                        className={cn(
                          "transition-transform duration-300 origin-center text-current opacity-90",
                          isActive && "opacity-100 scale-110",
                        )}
                        aria-hidden="true"
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span
                        className={cn(
                          "text-[0.65rem] tracking-wide transition-all duration-300",
                          isActive ? "font-semibold" : "font-medium",
                        )}
                      >
                        {tab.label}
                      </span>
                    </motion.div>
                  </>
                )}
              </NavLink>
            );
          })}
        </motion.nav>
      )}
    </div>
  );
};
