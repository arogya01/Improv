import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EtherealBackground } from "../components/effects/EtherealBackground";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[100dvh] bg-transparent text-ink-900 font-ui overflow-hidden selection:bg-teal-100">
      {/* Background WebGL Shader */}
      <EtherealBackground />

      {/* Top Navigation */}
      <nav className="w-full flex justify-between items-center px-8 py-6 max-w-7xl mx-auto z-10">
        <div className="flex items-baseline gap-2">
          <span className="font-space font-medium text-lg tracking-tight">
            Improv
          </span>
        </div>

        {/* Decorative elements representing the 'Mac/Zen' blend */}
        <div className="flex gap-6 items-center">
          <button className="text-sm tracking-wide text-ink-600 hover:text-ink-900 transition-colors uppercase cursor-pointer bg-transparent border-none">
            About
          </button>
          <button className="text-sm tracking-wide text-ink-600 hover:text-ink-900 transition-colors uppercase cursor-pointer bg-transparent border-none">
            Manifesto
          </button>
        </div>
      </nav>

      {/* Main Center Module: The "CD / Polaroid" entry point */}
      <div className="flex-1 flex items-center justify-center w-full z-10 perspective-[1000px]">
        {/* Container handling the floating rotation */}
        <motion.button
          onClick={() => navigate("/app")}
          aria-label="Enter Application"
          className="group relative flex flex-col items-center justify-center w-[280px] h-[360px] cursor-pointer border-none bg-transparent outline-none"
          initial={{ opacity: 0, y: 30, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* 
            The physical card object 
            Applying a glassmorphic aesthetic with strong shadows simulating depth.
          */}
          <motion.div
            className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/80 rounded-sm shadow-ethereal-lg overflow-hidden flex flex-col justify-between p-6"
            animate={{
              y: [0, -8, 0], // Gentle floating loop
              rotateZ: [0, 1, 0, -1, 0], // extremely subtle tilt
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Inner top metadata */}
            <div className="flex justify-between w-full text-[0.6rem] font-mono tracking-widest text-ink-400 uppercase">
              <span>Vol. 01</span>
              <span>Daily Practice</span>
            </div>

            {/* Central abstract art or text */}
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Chromatic aberration span on hover via pseudo elements and group-hover */}
              <span className="font-space text-4xl font-light tracking-tighter text-ink-900 relative">
                <span className="relative z-10">Enter</span>
                <span className="absolute inset-0 text-cyan-500/50 -translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Enter
                </span>
                <span className="absolute inset-0 text-red-500/50 translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  Enter
                </span>
              </span>
              <div className="h-[1px] w-8 bg-ink-200" />
            </div>

            {/* Inner bottom metadata */}
            <div className="flex justify-center w-full">
              <span className="text-[0.6rem] font-medium tracking-widest text-ink-300 uppercase group-hover:text-teal-600 transition-colors duration-500">
                Click to Initialize
              </span>
            </div>
          </motion.div>
        </motion.button>
      </div>

      {/* Footer / Bottom edge detail */}
      <div className="w-full flex justify-between px-8 py-6 max-w-7xl mx-auto z-10 text-[0.6rem] font-mono tracking-widest text-ink-400 uppercase">
        <span>© 2026 Improv Engine</span>
        <span>WebGL Active</span>
      </div>
    </div>
  );
};
