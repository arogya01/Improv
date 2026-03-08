import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { RouletteTopic } from "../../features/topics";

const ROW_HEIGHT_PX = 72;

type TopicSlotReelProps = {
  sequence: readonly RouletteTopic[];
  currentTopic: RouletteTopic | null;
  isSpinning: boolean;
  spinToken: number;
  className?: string | undefined;
};

function getTopicLabel(topic: RouletteTopic | null): string {
  if (!topic) {
    return "Spin to get a random topic";
  }

  return topic.text;
}

export function TopicSlotReel({
  sequence,
  currentTopic,
  isSpinning,
  spinToken,
  className,
}: TopicSlotReelProps): React.ReactElement {
  const shouldReduceMotion = useReducedMotion();
  const safeSequence = sequence.length > 0 ? sequence : [];

  const translateY = isSpinning
    ? -Math.max(0, safeSequence.length - 1) * ROW_HEIGHT_PX
    : 0;

  return (
    <div
      className={cn(
        "relative rounded-3xl border border-[var(--line-soft)] bg-[radial-gradient(circle_at_20%_16%,color-mix(in_srgb,var(--indigo-200)_16%,transparent)_0,transparent_44%),radial-gradient(circle_at_84%_82%,color-mix(in_srgb,var(--teal-300)_12%,transparent)_0,transparent_42%),var(--bg-glass)] shadow-ethereal-md overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[18px] z-[2] pointer-events-none bg-gradient-to-b from-[color-mix(in_srgb,var(--surface-raised)_94%,transparent)] to-transparent"
        aria-hidden="true"
      />
      <div className="relative h-[72px] overflow-hidden">
        <motion.div
          key={spinToken}
          className="will-change-transform"
          initial={{ y: 0 }}
          animate={{ y: translateY }}
          transition={
            shouldReduceMotion
              ? { duration: 0.12 }
              : { duration: 1.8, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {safeSequence.map((topic, index) => {
            const highlight = !isSpinning && currentTopic?.id === topic.id;
            return (
              <div
                key={`${topic.id}-${index}`}
                className={cn(
                  "grid content-center gap-1 px-4",
                  highlight && "animate-slot-active",
                )}
                style={{ height: `${ROW_HEIGHT_PX}px` }}
              >
                <span className="font-ui text-[0.65rem] font-bold uppercase tracking-[0.12em] text-teal-600">
                  {topic.category}
                </span>
                <span className="font-body text-base leading-tight tracking-tight text-ink-900 font-semibold">
                  {topic.text}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
      <div
        className="absolute inset-x-0 bottom-[44px] h-[18px] z-[2] pointer-events-none bg-gradient-to-t from-[color-mix(in_srgb,var(--surface-raised)_94%,transparent)] to-transparent"
        aria-hidden="true"
      />
      <div className="border-t border-[var(--line-soft)] bg-[color-mix(in_srgb,var(--surface-muted)_88%,transparent)] py-2 px-4 pb-3 font-ui text-[0.82rem] font-semibold text-ink-700 text-center">
        {getTopicLabel(currentTopic)}
      </div>
    </div>
  );
}
