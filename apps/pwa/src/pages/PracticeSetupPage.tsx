import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

import { BottomSheet, Button, Chip } from "../components/primitives";
import { TopicSlotReel } from "../components/roulette/TopicSlotReel";
import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";

export const PracticeSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setMediaType, setCameraFacing, setSelectedTopic } =
    usePracticeSetup();

  const roulette = useTopicRoulette({ initialTopic: draft.selectedTopic });
  const [isTopicPickerOpen, setIsTopicPickerOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!draft.selectedTopic && roulette.currentTopic) {
      setSelectedTopic(roulette.currentTopic);
    }
  }, [draft.selectedTopic, roulette.currentTopic, setSelectedTopic]);

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
  }, [
    draft.selectedTopic,
    roulette.currentTopic,
    roulette.isSpinning,
    roulette.spin,
    setSelectedTopic,
  ]);

  const selectedTopicLabel = useMemo(() => {
    if (!draft.selectedTopic) {
      return "Spin for a space to gather your thoughts.";
    }

    return draft.selectedTopic.text;
  }, [draft.selectedTopic]);

  const handleSpinAgain = async () => {
    const topic = await roulette.spin();
    setSelectedTopic(topic);
  };

  const handleStart = async () => {
    if (isStarting || roulette.isSpinning) {
      return;
    }

    setIsStarting(true);
    if (!draft.selectedTopic) {
      const topic = await roulette.spin();
      setSelectedTopic(topic);
    }

    // Enable view transitions for React Router v7
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: React router might not type this perfectly yet
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate("/practice/session");
      });
    } else {
      navigate("/practice/session");
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.34,
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  return (
    <div className="min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(3rem+92px)] relative overflow-hidden bg-transparent">
      <motion.div
        className="relative z-10 w-full max-w-[640px] mx-auto bg-white/35 backdrop-blur-[32px] border border-white/50 rounded-3xl shadow-ethereal-lg p-[clamp(1.5rem,4vw,2.5rem)] grid gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-start justify-between gap-3"
        >
          <h1 className="m-0 font-headline text-[clamp(2.4rem,6vw,3.7rem)] tracking-tight font-normal leading-tight text-ink-900">
            Session Format
          </h1>
          <Chip variant="info">Topic</Chip>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-white/50 bg-white/35 p-6 shadow-ethereal relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-teal-300/60 before:to-indigo-200/40"
        >
          <div className="text-xs tracking-widest uppercase text-teal-700 font-semibold font-ui">
            Selected Topic
          </div>
          <p className="my-3 mb-5 font-headline text-[clamp(1.5rem,4vw,2rem)] leading-snug font-normal text-ink-900 text-pretty">
            {selectedTopicLabel}
          </p>
          <div className="flex justify-start">
            <Button
              variant="secondary"
              onClick={() => setIsTopicPickerOpen(true)}
            >
              Respin
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-3">
          <label className="text-xs font-semibold uppercase tracking-widest text-ink-600 font-ui">
            Recording Type
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-full border border-white/50 bg-white/30 backdrop-blur-[32px]">
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`min-h-[3.1rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                draft.mediaType === "video"
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 bg-transparent hover:bg-white/30"
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setMediaType("audio")}
              className={`min-h-[3.1rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                draft.mediaType === "audio"
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 bg-transparent hover:bg-white/30"
              }`}
            >
              Audio
            </button>
          </div>
        </motion.div>

        {draft.mediaType === "video" && (
          <motion.div variants={itemVariants} className="grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-widest text-ink-600 font-ui">
              Camera
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-full border border-white/80 bg-white/50 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setCameraFacing("user")}
                className={`min-h-[3.1rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                  draft.cameraFacing === "user"
                    ? "bg-white text-teal-900 shadow-sm"
                    : "text-slate-600 bg-transparent hover:bg-white/30"
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setCameraFacing("environment")}
                className={`min-h-[3.1rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                  draft.cameraFacing === "environment"
                    ? "bg-white text-teal-900 shadow-sm"
                    : "text-slate-600 bg-transparent hover:bg-white/30"
                }`}
              >
                Back
              </button>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={roulette.isSpinning || isStarting}
            className="w-full min-h-[4rem] rounded-full border border-teal-200/40 bg-gradient-to-r from-teal-50/80 to-indigo-50/80 text-teal-900 font-ui text-[1.06rem] font-medium tracking-tight cursor-pointer flex items-center justify-center gap-3 shadow-ethereal transition-all duration-300 hover:not-disabled:translate-y-[-1px] hover:not-disabled:shadow-ethereal-md hover:not-disabled:border-teal-300/60 hover:not-disabled:from-teal-50 hover:not-disabled:to-indigo-50 active:not-disabled:translate-y-0 disabled:bg-white/30 disabled:text-ink-400 disabled:cursor-not-allowed disabled:shadow-none disabled:border-ink-100"
          >
            {roulette.isSpinning ? "Drawing..." : "Start"}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              aria-hidden="true"
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>

      <BottomSheet
        isOpen={isTopicPickerOpen}
        onClose={() => setIsTopicPickerOpen(false)}
        title="Draw a Topic"
      >
        <div className="grid gap-6">
          <TopicSlotReel
            sequence={roulette.spinSequence}
            currentTopic={roulette.currentTopic}
            isSpinning={roulette.isSpinning}
            spinToken={roulette.spinToken}
          />

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="primary"
              onClick={handleSpinAgain}
              isLoading={roulette.isSpinning}
            >
              Spin
            </Button>
            <Button variant="ghost" onClick={() => setIsTopicPickerOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
