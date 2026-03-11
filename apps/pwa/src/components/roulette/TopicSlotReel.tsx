import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { RouletteTopic } from "../../features/topics";

type TopicCardProps = {
  // We keep `sequence` and `spinToken` in the type to avoid breaking the parent, 
  // but we only strictly need `currentTopic` and `isSpinning` for the new look.
  sequence: readonly RouletteTopic[];
  currentTopic: RouletteTopic | null;
  isSpinning: boolean;
  spinToken: number;
  className?: string | undefined;
};

export function TopicSlotReel({
  currentTopic,
  isSpinning,
  className,
}: TopicCardProps): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 flex flex-col items-center justify-center min-h-[140px] transition-all duration-500",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isSpinning ? (
          <motion.div
            key="spinning"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 0.5, filter: "blur(2px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            <div className="h-6 w-48 max-w-[80%] bg-gray-300 animate-pulse rounded mt-2" />
          </motion.div>
        ) : currentTopic ? (
          <motion.div
            key={currentTopic.id}
            initial={{ opacity: 0, filter: "blur(4px)", y: 5 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)", y: -5 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="font-ui text-[0.65rem] font-bold uppercase tracking-[0.15em] text-gray-400">
              {currentTopic.category}
            </span>
            <span className="font-headline text-2xl md:text-3xl text-gray-900 font-medium tracking-tight text-balance leading-snug">
              {currentTopic.text}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="font-ui text-sm text-gray-400">
              Spin to select a topic
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
