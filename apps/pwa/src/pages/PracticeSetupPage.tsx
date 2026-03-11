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
    <div className="min-h-[calc(100vh-76px)] p-[clamp(1rem,4vw,3rem)] pb-[calc(3rem+92px)] relative overflow-hidden bg-transparent">
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto bg-white/40 backdrop-blur-[40px] border border-white/60 rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.03)] p-[clamp(2.5rem,6vw,4rem)] grid gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex items-start justify-between gap-3 border-b border-gray-200/50 pb-6"
        >
          <h1 className="m-0 font-headline text-[clamp(3rem,6vw,4.5rem)] tracking-tight font-medium leading-none text-gray-900">
            Session Format
          </h1>
          <Chip variant="default" className="mt-2 hidden sm:inline-flex">
            Practice
          </Chip>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-[24px] border border-white/80 bg-white/50 p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] relative overflow-hidden"
        >
          <div className="text-xs tracking-widest uppercase text-gray-500 font-semibold font-ui mb-4">
            Current Prompt
          </div>
          <p className="my-0 mb-8 font-headline text-[clamp(2rem,4vw,2.8rem)] leading-snug font-medium text-gray-900 text-pretty max-w-[28ch]">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <motion.div variants={itemVariants} className="grid gap-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 font-ui">
              Recording Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-full border border-gray-200/60 bg-white/50 backdrop-blur-[32px]">
              <button
                type="button"
                onClick={() => setMediaType("video")}
                className={`min-h-[3.5rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                  draft.mediaType === "video"
                    ? "bg-gray-900 text-gray-50 shadow-md"
                    : "text-gray-500 bg-transparent hover:bg-gray-100"
                }`}
              >
                Video
              </button>
              <button
                type="button"
                onClick={() => setMediaType("audio")}
                className={`min-h-[3.5rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                  draft.mediaType === "audio"
                    ? "bg-gray-900 text-gray-50 shadow-md"
                    : "text-gray-500 bg-transparent hover:bg-gray-100"
                }`}
              >
                Audio
              </button>
            </div>
          </motion.div>

          {draft.mediaType === "video" && (
            <motion.div variants={itemVariants} className="grid gap-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 font-ui">
                Camera View
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-full border border-gray-200/60 bg-white/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setCameraFacing("user")}
                  className={`min-h-[3.5rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                    draft.cameraFacing === "user"
                      ? "bg-gray-900 text-gray-50 shadow-md"
                      : "text-gray-500 bg-transparent hover:bg-gray-100/50"
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setCameraFacing("environment")}
                  className={`min-h-[3.5rem] border-0 rounded-full font-ui text-[0.95rem] font-medium transition-all duration-300 ease-out flex items-center justify-center ${
                    draft.cameraFacing === "environment"
                      ? "bg-gray-900 text-gray-50 shadow-md"
                      : "text-gray-500 bg-transparent hover:bg-gray-100/50"
                  }`}
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          variants={itemVariants}
          className="pt-4 border-t border-gray-200/50"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={roulette.isSpinning || isStarting}
            className="w-full min-h-[4.5rem] rounded-full bg-gray-900 text-gray-50 font-ui text-[1.1rem] font-medium tracking-wide cursor-pointer flex items-center justify-center gap-3 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
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
