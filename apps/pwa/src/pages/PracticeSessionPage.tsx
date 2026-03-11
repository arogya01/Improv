import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  usePracticeSetup,
  useRecordingSession,
  FrontendRecordingService,
  useAudioVolume,
  playSoundNudge
} from "../features/practice";
import { libraryService } from "../lib/client-services";
import { ParticleOrb } from "../components/ParticleOrb";

const recordingService = new FrontendRecordingService(libraryService);

export const PracticeSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { draft } = usePracticeSetup();

  const { vm, startRecording, stopRecording, cancelRecording, getAdapter } =
    useRecordingSession({
      draft,
      recordingService,
      authState: { status: "guest" },
      onSaved: () => {
        setTimeout(() => navigate("/library"), 1200);
      },
    });

  // Redirect if no prompt drafted
  useEffect(() => {
    if (!draft.prompt) {
      navigate("/practice/setup", { replace: true });
    }
  }, [draft.prompt, navigate]);

  const [stream, setStream] = useState<MediaStream | null>(null);

  // Poll for the adapter stream so we can pass it to useAudioVolume
  // getAdapter() returns the raw recording adapter which has a .stream property when active
  useEffect(() => {
    if (vm.status === "recording") {
      const adapter = getAdapter() as any;
      if (adapter && adapter.stream) {
        setStream(adapter.stream);
      }
    } else {
      setStream(null);
    }
  }, [vm.status, getAdapter]);

  const volume = useAudioVolume(stream, 0.85);

  const handleCancel = () => {
    cancelRecording();
    navigate(-1);
  };

  const toggleRecording = () => {
    if (vm.status === "ready" || vm.status === "idle" || vm.status === "setup") {
      // It might be in an initial state depending on the exact state machine
      playSoundNudge("start");
      startRecording();
    } else if (vm.status === "recording") {
      playSoundNudge("stop");
      stopRecording();
    }
  };

  const isRecording = vm.status === "recording";

  return (
    <div className="flex flex-col min-h-[calc(100vh-48px)] text-ink-800 relative overflow-hidden items-center justify-center bg-[#fafafc]">
      
      {/* Top Prompt Section */}
      <div className="absolute top-[20vh] w-full px-8 flex justify-center z-10 pointer-events-none">
        <AnimatePresence>
          {draft.selectedTopic && (
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-normal tracking-tight text-ink-600 text-center max-w-[280px]"
            >
              {draft.selectedTopic.text}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Main Orb */}
      <div className="relative w-64 h-64 flex items-center justify-center z-0 transition-opacity duration-700">
        <ParticleOrb volume={isRecording ? volume : 0} baseRadius={45} />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-16 w-full flex justify-center items-center gap-6 z-20">
        <button
          className="w-14 h-14 flex items-center justify-center rounded-full bg-black/[0.04] text-ink-500 cursor-pointer transition-all duration-300 hover:bg-black/[0.08]"
          onClick={handleCancel}
          aria-label="Cancel"
        >
          <iconify-icon icon="solar:close-circle-linear" className="text-[1.75rem]" />
        </button>

        <button
          className={`w-14 h-14 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 relative ${
            isRecording 
              ? "bg-white text-teal-600 shadow-[0_8px_24px_rgba(20,184,166,0.15)] scale-110" 
              : "bg-black/[0.04] text-ink-700 hover:bg-black/[0.08]"
          }`}
          onClick={toggleRecording}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          <iconify-icon 
            icon={isRecording ? "solar:stop-circle-linear" : "solar:microphone-3-linear"} 
            className="text-[1.5rem]" 
          />
          {isRecording && (
             <span className="absolute top-0 right-0 w-3 h-3 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)] animate-pulse" />
          )}
        </button>
      </div>

      {/* Finishing / Saving Overlays */}
      {["stopping", "saving", "saved", "error"].includes(vm.status) && (
        <div className="absolute inset-0 bg-[#fafafc]/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in">
          {vm.status !== "error" && vm.status !== "saved" && (
            <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
          )}

          {vm.status === "saved" && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <iconify-icon icon="solar:check-circle-linear" className="text-5xl text-teal-600" />
            </motion.div>
          )}

          <h2 className="text-xl font-normal mt-6 text-ink-900 tracking-tight">
            {vm.status === "stopping" && "Finishing..."}
            {vm.status === "saving" && "Saving session..."}
            {vm.status === "saved" && "Saved!"}
            {vm.status === "error" && "Error"}
          </h2>

          {vm.status === "error" && (
            <>
              <p className="text-red-500 text-sm mt-4 text-center px-6">
                {vm.lastErrorMessage || "Failed to save."}
              </p>
              <button
                className="mt-6 py-3 px-6 bg-black/[0.04] text-ink-800 rounded-full font-medium text-sm cursor-pointer"
                onClick={() => navigate("/")}
              >
                Return Home
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

