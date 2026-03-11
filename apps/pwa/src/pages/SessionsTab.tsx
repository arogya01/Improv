import React, { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon: string;
        inline?: boolean;
      };
    }
  }
}
import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";
import { TopicSlotReel } from "../components/roulette/TopicSlotReel";
import { cn } from "../lib/utils";

export const SessionsTab: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setSelectedTopic } = usePracticeSetup();
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
    }, 300);
  };

  const handleRespin = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const topic = await roulette.spin();
    setSelectedTopic(topic);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-20 bg-transparent selection:bg-stone-200 selection:text-stone-900 overflow-hidden">
      <motion.div
        className="flex flex-col items-center max-w-[480px] w-full text-center gap-8 md:gap-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          <h1 className="font-headline text-4xl md:text-5xl font-medium tracking-tight text-gray-900 text-balance leading-[1.1]">
            What will you speak about today?
          </h1>
          <p className="text-sm font-ui text-gray-500 max-w-[28ch] text-balance">
            Allow your thoughts to run free. Select a topic, or let chance decide.
          </p>
        </div>

        {/* Central Topic Component */}
        <div className="flex flex-col items-center gap-4 w-full">
          <TopicSlotReel
            sequence={roulette.spinSequence}
            currentTopic={roulette.currentTopic}
            isSpinning={roulette.isSpinning}
            spinToken={roulette.spinToken}
            className="w-full"
          />
          {/* Shuffle Button */}
          <motion.button
            onClick={() => handleRespin()}
            disabled={roulette.isSpinning}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full",
              "font-ui text-sm font-medium tracking-wide",
              "text-gray-500 bg-gray-100/80 hover:bg-gray-200/80 hover:text-gray-900",
              "border border-gray-200/60",
              "transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none",
            )}
            title="Shuffle Topic"
          >
            <iconify-icon icon="solar:refresh-circle-linear" style={{ fontSize: '1.1rem' }} />
            <span>Shuffle</span>
          </motion.button>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-5 w-full">
          <button
            onClick={handleStart}
            disabled={roulette.isSpinning || isLaunching}
            className={cn(
              "group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500",
              "bg-gray-900 text-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] active:scale-95",
              "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            )}
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span
              className={cn("iconify text-3xl transition-transform duration-500", isLaunching ? "animate-spin" : "group-hover:scale-110")}
              data-icon={isLaunching ? "solar:loading-linear" : "solar:microphone-3-bold"}
            />
            {/* Minimal text indicator below */}
            <span className="absolute -bottom-8 text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
              {isLaunching ? "Preparing" : "Record"}
            </span>
          </button>

          <p className="mt-4 text-sm font-light text-gray-400 italic max-w-[28ch] select-none text-balance">
            Speak spontaneously for 60 seconds to build mental agility.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

