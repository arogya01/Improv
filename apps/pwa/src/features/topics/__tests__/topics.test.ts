import { describe, expect, test } from "vitest";

import { buildSpinSequence, pickRandomTopic } from "../random";
import { TOPIC_DECK } from "../topic-deck";

describe("topic deck", () => {
  test("contains 120 unique, non-empty topics across all categories", () => {
    expect(TOPIC_DECK).toHaveLength(120);

    const ids = new Set(TOPIC_DECK.map((topic) => topic.id));
    expect(ids.size).toBe(120);

    const categories = new Set(TOPIC_DECK.map((topic) => topic.category));
    expect(categories).toEqual(
      new Set(["objects", "situations", "relationships", "professions", "emotions", "constraints"])
    );

    for (const topic of TOPIC_DECK) {
      expect(topic.text.trim().length).toBeGreaterThan(0);
      expect(topic.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("topic randomization", () => {
  test("avoids recently used topics when alternatives exist", () => {
    const recentIds = TOPIC_DECK.slice(0, 5).map((topic) => topic.id);
    const picked = pickRandomTopic(TOPIC_DECK, { seed: "recent-check", recentIds, recentWindow: 5 });

    expect(recentIds).not.toContain(picked.id);
  });

  test("is deterministic when a seed is provided", () => {
    const first = pickRandomTopic(TOPIC_DECK, { seed: "stable-seed" });
    const second = pickRandomTopic(TOPIC_DECK, { seed: "stable-seed" });

    expect(first.id).toBe(second.id);
  });

  test("spin sequence ends on the selected target", () => {
    const target = TOPIC_DECK[3]!;
    const sequence = buildSpinSequence(TOPIC_DECK, target, 12, "spin-seed");

    expect(sequence.length).toBe(13);
    expect(sequence.at(-1)?.id).toBe(target.id);
  });
});
