import React, { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "../components/primitives";
import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setMediaType, setSelectedTopic } = usePracticeSetup();
  const roulette = useTopicRoulette({ initialTopic: draft.selectedTopic });
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            void navigate("/practice/session");
          });
        } else {
          void navigate("/practice/session");
        }
      });
      setIsLaunching(false);
    }, 200);
  };

  const handleRespin = async () => {
    const topic = await roulette.spin();
    setSelectedTopic(topic);
  };

  const topicText =
    draft.selectedTopic?.text ??
    roulette.currentTopic?.text ??
    "Tap to draw a topic";

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-88px)] min-h-[calc(100dvh-88px)] p-6 px-4">
      <motion.div
        className="flex flex-col items-center gap-6 max-w-[420px] w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Breathing Orb */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-2">
          <div className="absolute inset-0 rounded-full border border-teal-600/[0.04] animate-orb-pulse" />
          <div className="relative w-[120px] h-[120px] rounded-full bg-white/35 backdrop-blur-[32px] border border-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.02)] overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full opacity-70"
            >
              <defs>
                <radialGradient id="homeOrbGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#818cf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </radialGradient>
                <filter id="homeOrbBlur">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="url(#homeOrbGlow)"
                filter="url(#homeOrbBlur)"
              >
                <animate
                  attributeName="r"
                  values="30;38;30"
                  dur="6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        </div>

        {/* Copy */}
        <h1 className="m-0 font-headline text-[clamp(2rem,6vw,2.8rem)] font-normal tracking-tight leading-[1.15] text-ink-900">
          Practice speaking.
          <br />
          60 seconds.
        </h1>
        <p className="m-0 text-[0.95rem] leading-relaxed text-ink-600 max-w-[32ch]">
          Get a random topic and just start talking. Build verbal confidence one
          rep at a time.
        </p>

        {/* Topic Preview */}
        <button
          className="flex items-center gap-3 w-full py-3 px-4 rounded-full bg-white/35 backdrop-blur-[32px] border border-white/60 cursor-pointer transition-all duration-300 text-left hover:bg-white/55 hover:shadow-ethereal disabled:cursor-wait disabled:opacity-70"
          onClick={handleRespin}
          disabled={roulette.isSpinning}
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-teal-600 flex-shrink-0">
            Topic
          </span>
          <span className="flex-1 text-[0.9rem] font-normal text-ink-800 overflow-hidden text-ellipsis whitespace-nowrap">
            {roulette.isSpinning ? "Drawing..." : topicText}
          </span>
          <span className="text-base text-ink-400 flex-shrink-0">↻</span>
        </button>

        {/* CTA */}
        <Button
          onClick={handleStart}
          isLoading={roulette.isSpinning || isLaunching}
        >
          Spin & Start
        </Button>

        {/* Format Toggle */}
        <div className="flex gap-1 p-1 bg-white/30 rounded-full border border-white/50">
          <button
            type="button"
            className={`py-2 px-5 border-none rounded-full font-ui text-[0.82rem] font-medium cursor-pointer transition-all duration-300 ${
              draft.mediaType === "video"
                ? "text-teal-900 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                : "text-ink-400 bg-transparent"
            }`}
            onClick={() => setMediaType("video")}
          >
            Video
          </button>
          <button
            type="button"
            className={`py-2 px-5 border-none rounded-full font-ui text-[0.82rem] font-medium cursor-pointer transition-all duration-300 ${
              draft.mediaType === "audio"
                ? "text-teal-900 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                : "text-ink-400 bg-transparent"
            }`}
            onClick={() => setMediaType("audio")}
          >
            Audio
          </button>
        </div>
      </motion.div>
    </div>
  );
};
