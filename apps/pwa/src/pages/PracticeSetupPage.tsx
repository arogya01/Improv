import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

import { BottomSheet, Button, Chip } from "../components/primitives";
import { TopicSlotReel } from "../components/roulette/TopicSlotReel";
import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";
import styles from "./PracticeSetupPage.module.css";

export const PracticeSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    draft,
    setMediaType,
    setCameraFacing,
    setSelectedTopic
  } = usePracticeSetup();

  const roulette = useTopicRoulette({ initialTopic: draft.selectedTopic });
  const [isTopicPickerOpen, setIsTopicPickerOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!draft.selectedTopic && roulette.currentTopic) {
      setSelectedTopic(roulette.currentTopic);
    }
  }, [draft.selectedTopic, roulette.currentTopic, setSelectedTopic]);

  useEffect(() => {
    if (!draft.selectedTopic && !roulette.currentTopic && !roulette.isSpinning) {
      roulette.spin().then((topic) => {
        setSelectedTopic(topic);
      });
    }
  }, [draft.selectedTopic, roulette.currentTopic, roulette.isSpinning, roulette.spin, setSelectedTopic]);

  const selectedTopicLabel = useMemo(() => {
    if (!draft.selectedTopic) {
      return "Spin to generate your first random improv topic.";
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

    navigate("/practice/session");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.34,
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } }
  };

  return (
    <div className={styles.container}>
      <motion.div className={styles.card} variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className={styles.headerRow}>
          <h1 className={styles.title}>Session Setup</h1>
          <Chip variant="info">Roulette Topic</Chip>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.topicCard}>
          <div className={styles.topicMeta}>Selected Topic</div>
          <p className={styles.topicText}>{selectedTopicLabel}</p>
          <div className={styles.topicActions}>
            <Button variant="secondary" onClick={() => setIsTopicPickerOpen(true)}>
              Spin Again
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.formGroup}>
          <label className={styles.label}>Recording Type</label>
          <div className={styles.toggleGroup}>
            <button
              type="button"
              onClick={() => setMediaType("video")}
              className={`${styles.toggleBtn} ${draft.mediaType === "video" ? styles.active : ""}`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setMediaType("audio")}
              className={`${styles.toggleBtn} ${draft.mediaType === "audio" ? styles.active : ""}`}
            >
              Audio
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
            disabled={roulette.isSpinning || isStarting}
            className={styles.startBtn}
          >
            {roulette.isSpinning ? "Spinning..." : "Start Session"}
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
        title="Topic Roulette"
      >
        <div className={styles.sheetBody}>
          <TopicSlotReel
            sequence={roulette.spinSequence}
            currentTopic={roulette.currentTopic}
            isSpinning={roulette.isSpinning}
            spinToken={roulette.spinToken}
          />

          <div className={styles.sheetButtons}>
            <Button variant="primary" onClick={handleSpinAgain} isLoading={roulette.isSpinning}>
              Spin Topic
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
