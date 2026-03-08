import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  usePracticeSetup,
  useRecordingSession,
  FrontendRecordingService,
} from "../features/practice";
import { libraryService } from "../lib/client-services";

const recordingService = new FrontendRecordingService(libraryService);

export const PracticeSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { draft } = usePracticeSetup();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { vm, startRecording, stopRecording, cancelRecording, getAdapter } =
    useRecordingSession({
      draft,
      recordingService,
      authState: { status: "guest" },
      onSaved: () => {
        setTimeout(() => navigate("/library"), 1200);
      },
    });

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted && draft.mediaType && draft.prompt) {
      setHasStarted(true);
      startRecording();
    }
  }, [draft.mediaType, draft.prompt, hasStarted, startRecording]);

  useEffect(() => {
    if (!draft.prompt || !draft.mediaType) {
      navigate("/practice/setup", { replace: true });
    }
  }, [draft.mediaType, draft.prompt, navigate]);

  useEffect(() => {
    if (draft.mediaType === "video" && videoRef.current) {
      const adapter = getAdapter();
      const stream = (adapter as unknown as { stream?: MediaStream }).stream;
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
    }
  }, [draft.mediaType, getAdapter, vm.status]);

  const handleCancel = () => {
    cancelRecording();
    navigate(-1);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const displayTime = formatTime(vm.remainingMs);

  return (
    <div className="flex flex-col min-h-[calc(100vh-48px)] text-ink-800 relative overflow-hidden items-center justify-between bg-transparent">
      {/* Header */}
      <header className="w-full max-w-[480px] mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="text-base font-medium tracking-tight text-ink-800">
          IMPROV
        </div>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/[0.02] border border-black/[0.03] backdrop-blur-lg text-ink-600 cursor-pointer transition-colors duration-200 p-0 hover:bg-black/[0.04]"
          onClick={handleCancel}
          aria-label="Cancel"
        >
          <iconify-icon
            icon="solar:close-circle-linear"
            style={{ fontSize: "1.25rem" }}
          />
        </button>
      </header>

      {/* Main Stage */}
      <main className="flex-1 w-full max-w-[480px] mx-auto flex flex-col items-center justify-center relative z-10 px-8 pb-12">
        {/* Prompt Section */}
        <div className="text-center mb-12 w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1 h-1 rounded-full bg-teal-500 opacity-50 animate-ethereal-pulse" />
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-teal-700 opacity-50 font-medium m-0">
              Daily Reflection
            </p>
            <span className="w-1 h-1 rounded-full bg-teal-500 opacity-50 animate-ethereal-pulse [animation-delay:1.75s]" />
          </div>
          <AnimatePresence>
            {draft.selectedTopic && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="font-headline text-[clamp(1.8rem,5vw,2.5rem)] font-normal tracking-tight text-ink-900 leading-[1.3] m-0 text-center">
                  {draft.selectedTopic.text}
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Organic Breathing Timer */}
        <div className="relative w-72 h-72 flex items-center justify-center -mt-8">
          <div className="absolute inset-0 rounded-full border border-teal-600/[0.03] scale-[1.15]" />
          <div className="absolute inset-4 rounded-full border border-indigo-900/[0.02] scale-105" />

          <div className="relative w-56 h-56 rounded-full overflow-hidden flex flex-col items-center justify-center backdrop-blur-[32px] border border-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.02)] bg-white/35 z-[2]">
            <div className="absolute bottom-0 left-0 w-full h-[45%] bg-gradient-to-t from-teal-500/[0.06] via-indigo-500/[0.03] to-transparent pointer-events-none" />

            {/* Breathing SVG */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
            >
              <defs>
                <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                  <stop offset="60%" stopColor="#818cf8" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                </radialGradient>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="url(#orbGlow)"
                filter="url(#softGlow)"
              >
                <animate
                  attributeName="r"
                  values="32;38;32"
                  dur="6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="none"
                stroke="#0f766e"
                strokeWidth="0.5"
                strokeOpacity="0.15"
              >
                <animate
                  attributeName="r"
                  values="15;25;15"
                  dur="8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.04;0.2;0.04"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>

            {/* Internal Preview / Video inside Circle */}
            {draft.mediaType === "video" && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
              />
            )}

            <div className="relative z-10 flex flex-col items-center gap-2 mt-2 [text-shadow:0_1px_2px_rgba(255,255,255,0.7)]">
              {vm.status === "recording" && (
                <>
                  <iconify-icon
                    icon="solar:microphone-3-linear"
                    className="text-teal-600 text-2xl"
                  />
                  <span className="text-[0.75rem] font-medium tracking-[0.1em] text-teal-700 opacity-50 uppercase">
                    Recording
                  </span>
                </>
              )}
              <span className="font-mono text-2xl text-teal-900 font-normal -mt-1 tracking-wide">
                {displayTime}
              </span>
            </div>
          </div>

          {/* Orbiting Particle */}
          <div className="absolute w-full h-full animate-orbit-spin pointer-events-none z-[3]">
            <div className="absolute top-0 left-1/2 w-[5px] h-[5px] bg-teal-500 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[0.5px] shadow-[0_0_6px_rgba(20,184,166,0.4)]" />
          </div>
        </div>
      </main>

      {/* Footer Controls Bottom Bar */}
      <footer className="w-full max-w-[480px] mx-auto p-6 pb-10 relative z-10">
        <div className="flex items-center justify-between p-2 rounded-full bg-white/55 border border-white/70 backdrop-blur-[32px] shadow-ethereal-md">
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full text-ink-400 bg-transparent border-none cursor-pointer transition-all duration-200 text-xl p-0 hover:text-ink-700 hover:bg-black/[0.03]"
            onClick={handleCancel}
            aria-label="Restart"
          >
            <iconify-icon icon="solar:restart-linear" />
          </button>

          <button
            className="flex items-center justify-center gap-3 py-3.5 px-8 rounded-full bg-gradient-to-r from-teal-50/70 to-indigo-50/70 border border-teal-200/50 text-teal-900 text-sm font-medium tracking-wide cursor-pointer transition-all duration-300 shadow-[0_2px_10px_rgba(20,184,166,0.06)] hover:border-teal-300/50 hover:bg-teal-50 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(20,184,166,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={stopRecording}
            disabled={vm.status !== "recording"}
            aria-label="Finish recording"
          >
            <span>Finish Thought</span>
            <iconify-icon
              icon="solar:check-circle-linear"
              className="text-lg text-teal-600 transition-transform duration-200 hover:scale-110"
            />
          </button>

          <button
            className="w-12 h-12 flex items-center justify-center rounded-full text-ink-400 bg-transparent border-none cursor-pointer transition-all duration-200 text-xl p-0 hover:text-ink-700 hover:bg-black/[0.03]"
            onClick={() => {}}
            aria-label="Skip"
          >
            <iconify-icon icon="solar:skip-next-linear" />
          </button>
        </div>
      </footer>

      {["stopping", "saving", "saved", "error"].includes(vm.status) && (
        <div className="absolute inset-0 bg-[rgba(250,250,252,0.88)] backdrop-blur-xl flex flex-col items-center justify-center z-50 animate-fade-in">
          {vm.status !== "error" && vm.status !== "saved" && (
            <div className="w-[52px] h-[52px] rounded-full border border-teal-500/20 border-t-teal-500 animate-spin" />
          )}

          {vm.status === "saved" && (
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <iconify-icon
                icon="solar:check-circle-linear"
                style={{ fontSize: "5rem", color: "var(--teal-600)" }}
              />
            </motion.div>
          )}

          <h2 className="font-headline text-[1.75rem] font-normal mt-6 text-ink-900 tracking-tight">
            {vm.status === "stopping" && "Finishing..."}
            {vm.status === "saving" && "Saving session..."}
            {vm.status === "saved" && "Saved!"}
            {vm.status === "error" && "Error"}
          </h2>

          {vm.status === "error" && (
            <>
              <p className="text-[var(--status-error)] text-sm mt-4 text-center px-6">
                {vm.lastErrorMessage || "Failed to save the recording."}
              </p>
              <button
                className="mt-6 py-3 px-6 bg-white/40 text-ink-800 border border-black/[0.06] rounded-full font-medium text-sm cursor-pointer"
                onClick={() => navigate("/")}
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
