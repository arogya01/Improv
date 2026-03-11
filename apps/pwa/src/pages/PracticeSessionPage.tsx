import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Square } from "lucide-react";
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
        setTimeout(() => navigate("/app/archive"), 1200);
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

  const isRecording = vm.status === "recording";
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            clearInterval(interval);
            playSoundNudge("stop");
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (vm.status === "idle" || vm.status === "ready") {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, stopRecording, vm.status]);

  const maxTime = 60;
  const timeRemaining = Math.max(0, maxTime - recordingTime);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    cancelRecording();
    navigate(-1);
  };

  const toggleRecording = () => {
    if (vm.status === "ready" || vm.status === "idle") {
      // It might be in an initial state depending on the exact state machine
      playSoundNudge("start");
      startRecording();
    } else if (vm.status === "recording") {
      playSoundNudge("stop");
      stopRecording();
    }
  };

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
        
        {/* Timer Display */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 font-ui text-sm font-medium tracking-wide text-ink-500 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-black/[0.03]"
            >
              {formatTime(timeRemaining)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Orb */}
      <div className="relative w-64 h-64 flex items-center justify-center z-0 transition-opacity duration-700">
        <ParticleOrb volume={isRecording ? volume : 0} baseRadius={45} className="w-full h-full" />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-16 w-full flex justify-center items-center gap-6 z-20">
        <button
          className="w-14 h-14 flex items-center justify-center rounded-full bg-black/[0.04] text-ink-500 cursor-pointer transition-all duration-300 hover:bg-black/[0.08]"
          onClick={handleCancel}
          aria-label="Cancel"
        >
          <X className="w-7 h-7" />
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
          {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
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
              <span className="iconify text-5xl text-teal-600" data-icon="solar:check-circle-linear"></span>
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

