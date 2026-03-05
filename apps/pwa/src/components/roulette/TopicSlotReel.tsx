import React from "react";
import { motion } from "framer-motion";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { RouletteTopic } from "../../features/topics";
import "./TopicSlotReel.css";

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
  className
}: TopicSlotReelProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const safeSequence = sequence.length > 0 ? sequence : [];

  const translateY = isSpinning
    ? -Math.max(0, safeSequence.length - 1) * ROW_HEIGHT_PX
    : 0;

  return (
    <div className={`topic-slot ${className ?? ""}`.trim()}>
      <div className="topic-slot__edge topic-slot__edge--top" aria-hidden="true" />
      <div className="topic-slot__window">
        <motion.div
          key={spinToken}
          className="topic-slot__rail"
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
                className={`topic-slot__item ${highlight ? "topic-slot__item--active" : ""}`}
                style={{ height: `${ROW_HEIGHT_PX}px` }}
              >
                <span className="topic-slot__category">{topic.category}</span>
                <span className="topic-slot__text">{topic.text}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
      <div className="topic-slot__edge topic-slot__edge--bottom" aria-hidden="true" />
      <div className="topic-slot__selected">{getTopicLabel(currentTopic)}</div>
    </div>
  );
}
