import React from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface MacWindowFrameProps {
  children: ReactNode;
}

export function MacWindowFrame({
  children,
}: MacWindowFrameProps): React.ReactElement {
  return (
    <div className="flex justify-center items-center min-h-dvh p-4 max-md:p-0 relative z-[1]">
      <motion.div
        className="w-full max-w-[1400px] h-[calc(100dvh-2rem)] max-md:h-dvh bg-white/35 backdrop-blur-[32px] rounded-3xl max-md:rounded-none border border-white/60 max-md:border-none shadow-ethereal-xl flex flex-col overflow-hidden"
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className="flex items-center h-12 px-4 bg-transparent border-b border-white/60 max-md:border-b-0 relative flex-shrink-0">
          <div className="flex gap-2 absolute left-4">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-40" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-40" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] opacity-40" />
          </div>
          <div className="flex-1 text-center font-ui text-[13px] font-normal uppercase tracking-[0.1em] text-ink-600">
            Improv
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative bg-transparent rounded-b-3xl max-md:rounded-b-none">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
