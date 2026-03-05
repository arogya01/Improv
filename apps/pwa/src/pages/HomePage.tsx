import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Button, Card } from "../components/primitives";
import { TopicSlotReel } from "../components/roulette/TopicSlotReel";
import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";
import styles from "./HomePage.module.css";

const CAPABILITIES = [
  { title: "Random Topics", copy: "Spin an ever-fresh improv topic in seconds." },
  { title: "60-Second Sessions", copy: "Practice fast and focused with auto-stop timing." },
  { title: "Offline by Default", copy: "Record and replay anytime with local Dexie storage." },
  { title: "Review and Iterate", copy: "Replay, favorite, and re-run topics with one tap." }
];

const HOW_IT_WORKS = [
  { step: "01", title: "Spin", copy: "Generate a topic with the roulette reel." },
  { step: "02", title: "Perform", copy: "Record a timed audio/video take." },
  { step: "03", title: "Reflect", copy: "Review it in your library and improve." }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setSelectedTopic } = usePracticeSetup();
  const roulette = useTopicRoulette({ initialTopic: draft.selectedTopic });
  const [isLaunching, setIsLaunching] = useState(false);

  const handleSpinAndStart = async () => {
    if (roulette.isSpinning || isLaunching) {
      return;
    }

    setIsLaunching(true);
    const topic = await roulette.spin();
    setSelectedTopic(topic);

    setTimeout(() => {
      navigate("/practice/setup");
      setIsLaunching(false);
    }, 300);
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgMesh} aria-hidden="true" />

      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.kicker}>Practice in Public Energy</p>
        <h2 className={styles.headline}>Build improv confidence, one random challenge at a time.</h2>
        <p className={styles.subtitle}>
          Cinematic topic roulette, precise 60-second takes, and local-first replay that keeps your momentum alive.
        </p>

        <TopicSlotReel
          className={styles.heroReel}
          sequence={roulette.spinSequence}
          currentTopic={roulette.currentTopic}
          isSpinning={roulette.isSpinning}
          spinToken={roulette.spinToken}
        />

        <div className={styles.heroActions}>
          <Button onClick={handleSpinAndStart} isLoading={roulette.isSpinning || isLaunching}>
            Spin & Start
          </Button>
          <Button variant="secondary" onClick={() => navigate("/library")}>Go to Library</Button>
        </div>
      </motion.section>

      <motion.section
        className={styles.capabilityGrid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
        }}
      >
        {CAPABILITIES.map((item) => (
          <motion.div key={item.title} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <Card className={styles.capabilityCard}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        className={styles.howItWorks}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
      >
        {HOW_IT_WORKS.map((item) => (
          <motion.article
            key={item.step}
            className={styles.flowCard}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            <span className={styles.step}>{item.step}</span>
            <h4>{item.title}</h4>
            <p>{item.copy}</p>
          </motion.article>
        ))}
      </motion.section>

      <div className={styles.bottomCtaWrap}>
        <Button className={styles.bottomCta} onClick={handleSpinAndStart} isLoading={roulette.isSpinning || isLaunching}>
          Spin & Start
        </Button>
      </div>
    </div>
  );
};
