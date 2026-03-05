import { useCallback, useMemo, useRef, useState } from "react";

import { buildSpinSequence, pickRandomTopic } from "./random";
import { TOPIC_DECK } from "./topic-deck";
import type { RouletteTopic } from "./types";

const SPIN_DURATION_MS = 1800;
const FALLBACK_TOPIC = TOPIC_DECK[0]!;

export type RouletteStatus = "idle" | "spinning" | "settled";

type UseTopicRouletteOptions = {
  initialTopic?: RouletteTopic | null;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useTopicRoulette(options: UseTopicRouletteOptions = {}) {
  const [status, setStatus] = useState<RouletteStatus>(
    options.initialTopic ? "settled" : "idle"
  );
  const [currentTopic, setCurrentTopic] = useState<RouletteTopic | null>(
    options.initialTopic ?? null
  );
  const [spinSequence, setSpinSequence] = useState<readonly RouletteTopic[]>(
    options.initialTopic ? [options.initialTopic] : []
  );
  const [spinToken, setSpinToken] = useState(0);
  const recentIdsRef = useRef<string[]>(options.initialTopic ? [options.initialTopic.id] : []);

  const isSpinning = status === "spinning";

  const spin = useCallback(async (): Promise<RouletteTopic> => {
    if (isSpinning) {
      return currentTopic ?? FALLBACK_TOPIC;
    }

    const target = pickRandomTopic(TOPIC_DECK, {
      recentIds: recentIdsRef.current,
      recentWindow: 5,
      seed: `${Date.now()}-${recentIdsRef.current.join("|")}`
    });

    const sequence = buildSpinSequence(TOPIC_DECK, target, 22, `${target.id}-${Date.now()}`);

    setStatus("spinning");
    setSpinSequence(sequence);
    setSpinToken((value) => value + 1);

    await sleep(SPIN_DURATION_MS);

    recentIdsRef.current = [...recentIdsRef.current, target.id].slice(-5);
    setCurrentTopic(target);
    setStatus("settled");

    return target;
  }, [currentTopic, isSpinning]);

  const exposedSequence = useMemo(() => {
    if (spinSequence.length > 0) {
      return spinSequence;
    }

    return currentTopic ? [currentTopic] : [FALLBACK_TOPIC];
  }, [currentTopic, spinSequence]);

  return {
    status,
    currentTopic,
    spinSequence: exposedSequence,
    spinToken,
    isSpinning,
    spin,
    spinDurationMs: SPIN_DURATION_MS
  };
}
