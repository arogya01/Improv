import React, { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";
import { cn } from "../lib/utils"; // Assuming a typical shadcn/tailwind merge utility exists, if not I'll just use template literals.

// Simple wave component imitating the reference image's soft organic timer/action cue.
const OrganicWave = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-full max-w-[200px] h-[40px] flex items-end justify-center overflow-hidden">
    <svg
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      className={cn(
        "absolute bottom-0 w-full h-[30px] transition-all duration-1000 ease-out",
        isActive ? "opacity-100 scale-y-100" : "opacity-30 scale-y-50",
      )}
    >
      <path
        d="M0,40 C50,40 70,5 100,5 C130,5 150,40 200,40 L200,40 L0,40 Z"
        fill="none"
        stroke="var(--ink-400)"
        strokeWidth="0.5"
        className="transition-all duration-1000 ease-out"
      />
      <path
        d="M0,40 C60,40 80,15 100,15 C120,15 140,40 200,40 L200,40 L0,40 Z"
        fill="none"
        stroke="var(--ink-200)"
        strokeWidth="1"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
    {/* Subtle central dot matching the reference image */}
    <motion.div
      className="absolute bottom-5 w-1 h-1 rounded-full bg-ink-300"
      animate={{
        y: isActive ? [0, -4, 0] : 0,
        opacity: isActive ? [0.4, 0.8, 0.4] : 0.4,
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <div className="absolute bottom-[2px] w-[1px] h-3 bg-ink-200" />
  </div>
);

export const SessionsTab: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setSelectedTopic } = usePracticeSetup();
  const roulette = useTopicRoulette({ initialTopic: draft.selectedTopic });
  const [isHovering, setIsHovering] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (
      !draft.selectedTopic &&
      !roulette.currentTopic &&
      !roulette.isSpinning
    ) {
      roulette.spin().then((topic) => {
        setSelectedTopic(topic);
      });
    }
  }, [draft.selectedTopic, roulette, setSelectedTopic]);

  const handleStart = async () => {
    if (roulette.isSpinning || isLaunching) return;

    setIsLaunching(true);
    let topic = draft.selectedTopic;
    if (!topic) {
      topic = await roulette.spin();
      setSelectedTopic(topic);
    }

    setTimeout(() => {
      startTransition(() => {
        // @ts-ignore
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            void navigate("/app/practice/session");
          });
        } else {
          void navigate("/app/practice/session");
        }
      });
      setIsLaunching(false);
    }, 300); // slightly longer pause to feel like a slow exhale
  };

  const handleRespin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const topic = await roulette.spin();
    setSelectedTopic(topic);
  };

  const topicText =
    draft.selectedTopic?.text ??
    roulette.currentTopic?.text ??
    "Tap to draw a topic";

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] pt-[max(env(safe-area-inset-top),20vh)] pb-[max(env(safe-area-inset-bottom),8vh)] px-6 bg-white selection:bg-ink-100 selection:text-ink-900">
      {/* Top spacer */}
      <div className="flex-1" />

      <motion.div
        className="flex flex-col items-center max-w-[480px] w-full text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main Prompt Area */}
        <div className="relative w-full min-h-[220px] flex flex-col items-center justify-center">
          <motion.div
            className="flex flex-col items-center gap-2 w-full"
            animate={{ opacity: isLaunching ? 0 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Subtle Greeting like "Hey Natural," */}
            <p className="m-0 text-xl font-light text-ink-300 tracking-wide select-none">
              Daily Prompt,
            </p>

            {/* The Topic / Active Text. Strict text-balance. */}
            <h1
              onClick={handleRespin}
              className={`
                m-0 mt-4 text-[clamp(1.5rem,5vw,2.25rem)] font-normal text-ink-900 
                leading-[1.3] text-balance tracking-tight cursor-pointer 
                transition-opacity duration-300
                ${roulette.isSpinning ? "opacity-30 blur-[2px]" : "opacity-100 blur-0"}
              `}
              title="Tap to draw a new topic"
            >
              {topicText}
            </h1>

            {/* Extremely subtle instructional text (text-pretty) */}
            <p className="mt-6 text-sm font-light text-ink-400 text-pretty max-w-[28ch] select-none opacity-60">
              Speak spontaneously for 60 seconds to build confidence.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1" />

      {/* Bottom Action Area with Organic Wave */}
      <motion.div
        className="w-full flex justify-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        <button
          onClick={handleStart}
          disabled={roulette.isSpinning || isLaunching}
          aria-label="Start recording 60 second session"
          className="group relative flex flex-col items-center gap-4 bg-transparent border-none cursor-pointer outline-none w-full max-w-[300px]"
        >
          {/* Subtle text cue */}
          <span
            className={cn(
              "text-[0.7rem] uppercase tracking-[0.2em] transition-all duration-500",
              isHovering ? "text-ink-800" : "text-ink-300",
            )}
          >
            {isLaunching ? "Beginning" : "Press to Begin"}
          </span>

          <OrganicWave isActive={isHovering || isLaunching} />
        </button>
      </motion.div>
    </div>
  );
};
