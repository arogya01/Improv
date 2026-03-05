import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { usePracticeSetup } from "../features/practice";
import { allPromptPacks } from "@improv/prompt-packs";
import styles from "./PracticeSetupPage.module.css";

export const PracticeSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setPromptPackId, setMediaType, setCameraFacing, setPrompt } =
    usePracticeSetup();

  useEffect(() => {
    if (!draft.promptPackId && allPromptPacks.length > 0) {
      setPromptPackId(allPromptPacks[0]!.id);
    }
  }, [draft.promptPackId, setPromptPackId]);

  const handleStart = () => {
    if (!draft.prompt && draft.promptPackId) {
      const pack = allPromptPacks.find((p) => p.id === draft.promptPackId);
      if (pack && pack.items.length > 0) {
        const randomItem =
          pack.items[Math.floor(Math.random() * pack.items.length)];
        setPrompt(randomItem ?? null);
      }
    }
    navigate("/practice/session");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className={styles.title}>
          Practice Setup
        </motion.h1>

        <motion.div variants={itemVariants} className={styles.formGroup}>
          <label className={styles.label}>Prompt Pack</label>
          <select
            className={styles.select}
            value={draft.promptPackId || ""}
            onChange={(e) => setPromptPackId(e.target.value)}
          >
            {allPromptPacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.name} ({pack.items.length} prompts)
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.formGroup}>
          <label className={styles.label}>Recording Type</label>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`${styles.toggleBtn} ${draft.mediaType === "video" ? styles.active : ""}`}
            >
              🎥 Video
            </button>
            <button
              type="button"
              onClick={() => setMediaType("audio")}
              className={`${styles.toggleBtn} ${draft.mediaType === "audio" ? styles.active : ""}`}
            >
              🎤 Audio
            </button>
          </div>
        </motion.div>

        {draft.mediaType === "video" && (
          <motion.div variants={itemVariants} className={styles.formGroup}>
            <label className={styles.label}>Camera</label>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                onClick={() => setCameraFacing("user")}
                className={`${styles.toggleBtn} ${draft.cameraFacing === "user" ? styles.active : ""}`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setCameraFacing("environment")}
                className={`${styles.toggleBtn} ${draft.cameraFacing === "environment" ? styles.active : ""}`}
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
            className={styles.startBtn}
          >
            Start Session
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};
