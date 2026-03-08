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
import { cn } from "../../lib/utils";

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
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-[color-mix(in_srgb,var(--surface-muted)_94%,transparent)] border border-[var(--line-soft)] rounded-3xl shadow-ethereal-md will-change-transform"
      style={{
        opacity: smoothOpacity,
        y: smoothY,
        scale: smoothScale,
      }}
    >
      <span className="inline-flex items-center justify-center w-[2.8rem] h-[2.8rem] rounded-full font-ui text-[0.8rem] font-bold tracking-widest uppercase text-[#10100f] bg-teal-500">
        {step.step}
      </span>
      <h3 className="m-0 font-headline text-[1.8rem] font-medium text-ink-900 tracking-tight">
        {step.title}
      </h3>
      <p className="m-0 max-w-[40ch] text-ink-700 font-body leading-relaxed">
        {step.copy}
      </p>
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
      className="w-2.5 h-2.5 rounded-full bg-teal-500"
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
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[980px] mx-auto",
          className,
        )}
      >
        {steps.map((step) => (
          <article
            key={step.key}
            className="relative flex flex-col items-center justify-center gap-3 p-6 bg-[color-mix(in_srgb,var(--surface-muted)_94%,transparent)] border border-[var(--line-soft)] rounded-3xl shadow-ethereal-md"
          >
            <span className="inline-flex items-center justify-center w-[2.8rem] h-[2.8rem] rounded-full font-ui text-[0.8rem] font-bold tracking-widest uppercase text-[#10100f] bg-teal-500">
              {step.step}
            </span>
            <h3 className="m-0 font-headline text-[1.8rem] font-medium text-ink-900 tracking-tight">
              {step.title}
            </h3>
            <p className="m-0 max-w-[40ch] text-ink-700 font-body leading-relaxed">
              {step.copy}
            </p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative h-[300vh]", className)}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-[760px] px-6 flex flex-col items-center gap-6 text-center">
          <h2 className="m-0 font-headline text-[clamp(2rem,4vw,3.25rem)] font-medium tracking-tighter text-ink-900">
            {title}
          </h2>

          <div className="flex items-center gap-3">
            {progressDots.map((dot, i) => (
              <ProgressDot
                key={steps[i]!.key}
                progress={scrollYProgress}
                start={dot.dotStart}
                end={dot.dotEnd}
              />
            ))}
          </div>

          <div className="relative w-full min-h-[220px] grid place-items-center">
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
