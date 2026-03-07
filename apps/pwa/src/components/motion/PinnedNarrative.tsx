import React, { useRef } from "react";
import {
  motion,
  type MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { MotionTokens } from "../../design/motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import styles from "./PinnedNarrative.module.css";

export interface NarrativeStep {
  key: string;
  step: string;
  title: string;
  copy: string;
}

interface PinnedNarrativeProps {
  steps: NarrativeStep[];
  title?: string;
  className?: string | undefined;
}

const StepCard: React.FC<{
  step: NarrativeStep;
  progress: MotionValue<number>;
  index: number;
  total: number;
}> = ({ step, progress, index, total }) => {
  const beatStart = index / total;
  const beatPeak = (index + 0.5) / total;
  const beatEnd = (index + 1) / total;

  const opacity = useTransform(
    progress,
    [beatStart, beatPeak, beatEnd],
    [0, 1, index === total - 1 ? 1 : 0],
  );
  const y = useTransform(progress, [beatStart, beatPeak], [40, 0]);
  const scale = useTransform(
    progress,
    [beatStart, beatPeak, beatEnd],
    [0.95, 1, index === total - 1 ? 1 : 0.95],
  );

  const smoothOpacity = useSpring(opacity, MotionTokens.parallaxSpring);
  const smoothY = useSpring(y, MotionTokens.parallaxSpring);
  const smoothScale = useSpring(scale, MotionTokens.parallaxSpring);

  return (
    <motion.article
      className={styles.stepCard}
      style={{
        opacity: smoothOpacity,
        y: smoothY,
        scale: smoothScale,
      }}
    >
      <span className={styles.stepBadge}>{step.step}</span>
      <h3 className={styles.stepTitle}>{step.title}</h3>
      <p className={styles.stepCopy}>{step.copy}</p>
    </motion.article>
  );
};

const ProgressDot: React.FC<{
  progress: MotionValue<number>;
  start: number;
  end: number;
}> = ({ progress, start, end }) => {
  const mid = (start + end) / 2;
  const opacity = useTransform(progress, [start, mid, end], [0.3, 1, 0.3]);
  const scale = useTransform(progress, [start, mid, end], [0.6, 1, 0.6]);
  const smoothOpacity = useSpring(opacity, MotionTokens.parallaxSpring);
  const smoothScale = useSpring(scale, MotionTokens.parallaxSpring);

  return (
    <motion.div
      className={styles.progressDot}
      style={{ opacity: smoothOpacity, scale: smoothScale }}
    />
  );
};

export const PinnedNarrative: React.FC<PinnedNarrativeProps> = ({
  steps,
  title = "How It Works",
  className,
}) => {
  const shouldReduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const progressDots = steps.map((_, i) => {
    const dotStart = i / steps.length;
    const dotEnd = (i + 1) / steps.length;
    return { dotStart, dotEnd };
  });

  if (shouldReduce) {
    return (
      <div className={`${styles.reducedGrid} ${className ?? ""}`}>
        {steps.map((step) => (
          <article key={step.key} className={styles.stepCard}>
            <span className={styles.stepBadge}>{step.step}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepCopy}>{step.copy}</p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.pinnedContainer} ${className ?? ""}`}
    >
      <div className={styles.stickyStage}>
        <div className={styles.stageContent}>
          <h2 className={styles.sectionTitle}>{title}</h2>

          <div className={styles.progressTrack}>
            {progressDots.map((dot, i) => (
              <ProgressDot
                key={steps[i]!.key}
                progress={scrollYProgress}
                start={dot.dotStart}
                end={dot.dotEnd}
              />
            ))}
          </div>

          <div className={styles.stepsRegion}>
            {steps.map((step, i) => (
              <StepCard
                key={step.key}
                step={step}
                progress={scrollYProgress}
                index={i}
                total={steps.length}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
