import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  usePracticeSetup,
  useRecordingSession,
  FrontendRecordingService
} from "../features/practice";
import { libraryService } from "../lib/client-services";
import styles from "./PracticeSessionPage.module.css";

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
      }
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
        {draft.selectedTopic && (
          <motion.div
            className={styles.promptCard}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className={styles.promptText}>{draft.selectedTopic.text}</p>
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
          className={`${styles.recordBtn} ${vm.status === "recording" ? styles.recording : ""}`}
          onClick={stopRecording}
          disabled={vm.status !== "recording"}
          aria-label="Stop recording"
        >
          <div className={styles.recordBtnInner} />
        </button>
      </div>

      {["stopping", "saving", "saved", "error"].includes(vm.status) && (
        <div className={styles.overlay}>
          {vm.status !== "error" && vm.status !== "saved" && <div className={styles.spinner} />}

          {vm.status === "saved" && (
            <motion.div initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
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
              <p className={styles.errorText}>{vm.lastErrorMessage || "Failed to save the recording."}</p>
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
