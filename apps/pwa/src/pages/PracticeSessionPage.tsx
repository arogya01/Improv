import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePracticeSetup,
  useRecordingSession,
  FrontendRecordingService,
} from "../features/practice";
// We need auth state and Library service for real app, mock it for now until we have context:
import { LibraryService } from "../features/library/library-service";
import { ImprovDatabase } from "../db/database";
import styles from "./PracticeSessionPage.module.css";

// Temporary singleton for DB/Service until Context exists:
const db = new ImprovDatabase();
const libService = new LibraryService(db);
const recordingService = new FrontendRecordingService(libService);

export const PracticeSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { draft } = usePracticeSetup();
  const videoRef = useRef<HTMLVideoElement>(null);

  // We start automatically when hitting this page if the user hit "Start Session"
  const { vm, startRecording, stopRecording, cancelRecording, getAdapter } =
    useRecordingSession({
      draft,
      recordingService,
      authState: { status: "guest" }, // Using guest until Auth is implemented
      onSaved: () => {
        // give it a second to show "Saved" state before navigating
        setTimeout(() => navigate("/library"), 1500);
      },
    });

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted && draft.mediaType) {
      setHasStarted(true);
      startRecording();
    }
  }, [hasStarted, draft.mediaType, startRecording]);

  useEffect(() => {
    // Connect video stream if video mode
    if (draft.mediaType === "video" && videoRef.current) {
      // get the stream from the adapter (a small hack to get raw stream)
      // The media adapter in this version doesn't export `stream` publicly, but we can access `(adapter as any).stream`.
      // Let's assume we can cast it
      const adapter = getAdapter();
      const stream = (adapter as any).stream;
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // prevent feedback loop locally
      }
    }
  }, [vm.status, draft.mediaType, getAdapter]);

  const handleCancel = () => {
    cancelRecording();
    navigate(-1);
  };

  const handleStop = () => {
    if (vm.status === "recording") {
      stopRecording();
    }
  };

  // Format timer
  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const displayTime = formatTime(vm.remainingMs);
  const totalSeconds = Math.ceil(vm.remainingMs / 1000);
  let timerClass = styles.timer;
  if (totalSeconds <= 10) timerClass += ` ${styles.danger}`;
  else if (totalSeconds <= 30) timerClass += ` ${styles.warning}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.cancelBtn} onClick={handleCancel}>
          Cancel
        </button>
      </div>

      <AnimatePresence>
        {draft.prompt && (
          <motion.div
            className={styles.promptCard}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className={styles.promptText}>{draft.prompt.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.previewContainer}>
        {draft.mediaType === "video" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={styles.videoPreview}
          />
        ) : (
          <div className={styles.audioVisualizer}>
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={timerClass}>{displayTime}</div>

        <button
          className={`${styles.recordBtn} ${
            vm.status === "recording" ? styles.recording : ""
          }`}
          onClick={handleStop}
          disabled={vm.status !== "recording"}
          aria-label="Stop recording"
        >
          <div className={styles.recordBtnInner} />
        </button>
      </div>

      {["stopping", "saving", "saved", "error"].includes(vm.status) && (
        <div className={styles.overlay}>
          {vm.status !== "error" && vm.status !== "saved" && (
            <div className={styles.spinner} />
          )}

          {vm.status === "saved" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--status-synced)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </motion.div>
          )}

          <h2 className={styles.statusText}>
            {vm.status === "stopping" && "Finishing..."}
            {vm.status === "saving" && "Saving session..."}
            {vm.status === "saved" && "Saved!"}
            {vm.status === "error" && "Error"}
          </h2>

          {vm.status === "error" && (
            <>
              <p className={styles.errorText}>
                {vm.lastErrorMessage || "Failed to save the recording."}
              </p>
              <button className={styles.backBtn} onClick={() => navigate("/")}>
                Return to Home
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
