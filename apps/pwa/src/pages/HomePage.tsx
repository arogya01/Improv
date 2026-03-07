import React, { startTransition, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import { PinnedNarrative, ParallaxLayer, RevealItem, RevealSection } from "../components/motion";
import { Button, Card } from "../components/primitives";
import { TopicSlotReel } from "../components/roulette/TopicSlotReel";
import { usePracticeSetup } from "../features/practice";
import { useTopicRoulette } from "../features/topics";
import styles from "./HomePage.module.css";

const SIGNALS = [
  {
    eyebrow: "Editorial Motion",
    title: "A landing page that feels staged, not stacked.",
    copy:
      "Affinity's parallax language becomes a layered performance surface here: big typography, slow drift, and reveals that hand information to you in beats.",
    tone: "var(--accent-cyan)",
  },
  {
    eyebrow: "Calm Product Surfaces",
    title: "The motion stays on the story, not on the controls.",
    copy:
      "Once you enter the app, the same visual system remains in place but the motion quiets down so setup, capture, and review stay fast and legible.",
    tone: "var(--accent-coral)",
  },
];

const ARCHIVE_PANELS = [
  {
    title: "Capture the rep",
    copy: "Start from a fresh constraint, set your format, and keep the setup surface clean enough that the rep starts almost immediately.",
    meta: "Prompt + session",
  },
  {
    title: "Archive the sharp takes",
    copy: "The library becomes an editorial archive instead of a file dump, with enough hierarchy to spot strong sessions at a glance.",
    meta: "Local-first library",
  },
  {
    title: "Review without friction",
    copy: "Playback, favoriting, and repeat practice stay inside the same visual grammar, so the app feels like one studio, not separate tools.",
    meta: "Playback + iteration",
  },
];

const NARRATIVE_STEPS = [
  {
    key: "spin",
    step: "01",
    title: "Spin",
    copy: "Pull a constraint that feels specific enough to spark a scene without making the prep feel heavy.",
  },
  {
    key: "perform",
    step: "02",
    title: "Perform",
    copy: "Step into a focused recording surface with timing, prompt framing, and just enough chrome to stay oriented.",
  },
  {
    key: "review",
    step: "03",
    title: "Review",
    copy: "Archive your takes, favorite what worked, and return to the library with context instead of clutter.",
  },
];

const ARCHIVE_PREVIEW = [
  "Status scene · 0:58",
  "Elevator stop · 1:00",
  "Late-night monologue · 0:46",
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { draft, setSelectedTopic } = usePracticeSetup();
  const roulette = useTopicRoulette({ initialTopic: draft.selectedTopic });
  const [isLaunching, setIsLaunching] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const handleSpinAndStart = async () => {
    if (roulette.isSpinning || isLaunching) {
      return;
    }

    setIsLaunching(true);
    const topic = await roulette.spin();
    setSelectedTopic(topic);

    window.setTimeout(() => {
      startTransition(() => {
        void navigate("/practice/setup");
      });
      setIsLaunching(false);
    }, 240);
  };

  return (
    <div className={styles.page}>
      <section ref={heroRef} className={styles.hero} id="launch">
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <RevealSection as="header" className={styles.heroCopy} threshold={0.14}>
            <RevealItem>
              <p className={styles.kicker}>Affinity-inspired motion for a rehearsal studio</p>
            </RevealItem>
            <RevealItem>
              <h1 className={styles.headline}>Practice with the energy of a launch page and the focus of a studio tool.</h1>
            </RevealItem>
            <RevealItem>
              <p className={styles.subtitle}>
                Big editorial type, scroll-driven reveals, and a product flow that gets you from prompt to playback without losing pace.
              </p>
            </RevealItem>
            <RevealItem>
              <div className={styles.heroActions}>
                <Button
                  onClick={() => {
                    void handleSpinAndStart();
                  }}
                  isLoading={roulette.isSpinning || isLaunching}
                >
                  Spin & Start
                </Button>
                <Button variant="secondary" onClick={() => navigate("/library")}>
                  Open Library
                </Button>
              </div>
            </RevealItem>
            <RevealItem>
              <div className={styles.heroMeta}>
                <span>Scroll-led reveal</span>
                <span>Adaptive light/dark</span>
                <span>Local-first archive</span>
              </div>
            </RevealItem>
          </RevealSection>

          <div className={styles.heroVisuals}>
            <ParallaxLayer target={heroRef} distance={48} className={styles.heroHalo} />

            <ParallaxLayer target={heroRef} distance={28} className={`${styles.heroCard} ${styles.heroCardLeft}`}>
              <article className={styles.miniPanel}>
                <span className={styles.panelLabel}>Current prompt</span>
                <p>{roulette.currentTopic?.text ?? "Wrangled Earphones"}</p>
                <small>Object drill</small>
              </article>
            </ParallaxLayer>

            <ParallaxLayer target={heroRef} distance={16} className={`${styles.heroCard} ${styles.heroCardQuote}`}>
              <article className={styles.quotePanel}>
                <span>60-second sessions</span>
                <p>Structured reps that feel cinematic instead of clinical.</p>
              </article>
            </ParallaxLayer>

            <ParallaxLayer target={heroRef} distance={48} className={`${styles.heroCard} ${styles.heroCardCenter}`}>
              <article className={styles.studioPanel}>
                <div className={styles.studioHeader}>
                  <span>Live roulette</span>
                  <span>Editorial shell</span>
                </div>

                <TopicSlotReel
                  className={styles.heroReel}
                  sequence={roulette.spinSequence}
                  currentTopic={roulette.currentTopic}
                  isSpinning={roulette.isSpinning}
                  spinToken={roulette.spinToken}
                />

                <div className={styles.studioMetrics}>
                  <div>
                    <strong>60s</strong>
                    <span>session pace</span>
                  </div>
                  <div>
                    <strong>Local</strong>
                    <span>offline archive</span>
                  </div>
                  <div>
                    <strong>Repeat</strong>
                    <span>fast iteration</span>
                  </div>
                </div>
              </article>
            </ParallaxLayer>

            <ParallaxLayer target={heroRef} distance={80} className={`${styles.heroCard} ${styles.heroCardRight}`}>
              <article className={styles.archivePanel}>
                <div className={styles.archiveHeader}>
                  <span>Library snapshot</span>
                  <span>03 sessions</span>
                </div>

                <ul className={styles.archiveList}>
                  {ARCHIVE_PREVIEW.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </ParallaxLayer>
          </div>
        </div>
      </section>

      <div className={styles.ribbon} aria-hidden="true">
        <div className={styles.ribbonTrack}>
          <span>scroll-linked hero</span>
          <span>progressive reveal</span>
          <span>pinned workflow</span>
          <span>editorial archive</span>
          <span>adaptive studio shell</span>
          <span>scroll-linked hero</span>
          <span>progressive reveal</span>
          <span>pinned workflow</span>
        </div>
      </div>

      <section className={styles.sectionBlock} id="system">
        <RevealSection className={styles.sectionIntro} threshold={0.2}>
          <RevealItem>
            <p className={styles.sectionKicker}>Shared Visual System</p>
          </RevealItem>
          <RevealItem>
            <h2 className={styles.sectionTitle}>One palette, one shell, one motion language.</h2>
          </RevealItem>
          <RevealItem>
            <p className={styles.sectionCopy}>
              The landing page does the heavy visual storytelling. The rest of the app inherits the same typography, surfaces,
              accents, and pacing without turning task screens into motion demos.
            </p>
          </RevealItem>
        </RevealSection>

        <RevealSection className={styles.signalGrid} threshold={0.14}>
          {SIGNALS.map((signal) => (
            <RevealItem
              key={signal.title}
              className={styles.signalItem}
            >
              <Card
                className={styles.signalCard}
                style={{ ["--panel-accent" as string]: signal.tone } as CSSProperties}
              >
                <span className={styles.signalEyebrow}>{signal.eyebrow}</span>
                <h3>{signal.title}</h3>
                <p>{signal.copy}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealSection>
      </section>

      <section className={styles.workflowBlock} id="workflow">
        <RevealSection className={styles.workflowIntro} threshold={0.16}>
          <RevealItem>
            <p className={styles.sectionKicker}>Pinned Story Section</p>
          </RevealItem>
          <RevealItem>
            <h2 className={styles.sectionTitle}>Scroll through the product rhythm in three beats.</h2>
          </RevealItem>
        </RevealSection>

        <PinnedNarrative
          className={styles.workflowNarrative}
          title="Spin. Perform. Review."
          steps={NARRATIVE_STEPS}
        />
      </section>

      <section className={styles.sectionBlock} id="archive">
        <RevealSection className={styles.sectionIntro} threshold={0.16}>
          <RevealItem>
            <p className={styles.sectionKicker}>Archive Surfaces</p>
          </RevealItem>
          <RevealItem>
            <h2 className={styles.sectionTitle}>The rest of the routes inherit the same editorial grammar.</h2>
          </RevealItem>
        </RevealSection>

        <RevealSection className={styles.archiveGrid} threshold={0.14}>
          {ARCHIVE_PANELS.map((panel) => (
            <RevealItem key={panel.title} className={styles.archiveItem}>
              <Card className={styles.archiveCard}>
                <span className={styles.archiveMeta}>{panel.meta}</span>
                <h3>{panel.title}</h3>
                <p>{panel.copy}</p>
              </Card>
            </RevealItem>
          ))}
        </RevealSection>
      </section>

      <section className={styles.ctaBand}>
        <div className={styles.ctaInner}>
          <p className={styles.sectionKicker}>Launch The Flow</p>
          <h2 className={styles.ctaTitle}>Ready to test the motion in a real improv session?</h2>
          <p className={styles.ctaCopy}>
            Spin a topic, record a take, and watch the rest of the app settle into the calmer side of the same visual system.
          </p>
          <div className={styles.ctaActions}>
            <Button
              onClick={() => {
                void handleSpinAndStart();
              }}
              isLoading={roulette.isSpinning || isLaunching}
            >
              Spin & Start
            </Button>
            <Button variant="secondary" onClick={() => navigate("/settings")}>
              View System Routes
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
