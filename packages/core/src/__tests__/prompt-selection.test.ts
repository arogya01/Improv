import { describe, expect, it } from "vitest";

import { PromptPackEmptyError } from "../errors.js";
import { selectDailyChallengePrompt, selectFreePracticePrompt } from "../prompt-selection.js";
import type { PromptPack } from "../types.js";

const pack: PromptPack = {
  id: "fixture-pack",
  name: "Fixture Pack",
  version: 1,
  items: Array.from({ length: 10 }, (_, index) => ({
    id: `fixture_${index + 1}`,
    text: `Prompt ${index + 1}`,
    tags: ["fixture"]
  }))
};

describe("prompt selection", () => {
  it("returns the same daily challenge prompt for the same date + pack + seedVersion", () => {
    const first = selectDailyChallengePrompt({
      localDate: "2026-02-24",
      promptPack: pack,
      seedVersion: 1
    });
    const second = selectDailyChallengePrompt({
      localDate: "2026-02-24",
      promptPack: pack,
      seedVersion: 1
    });

    expect(first.id).toBe(second.id);
  });

  it("produces valid and varied daily prompts across dates", () => {
    const ids = new Set(
      ["2026-02-24", "2026-02-25", "2026-02-26", "2026-02-27", "2026-02-28"].map((localDate) =>
        selectDailyChallengePrompt({ localDate, promptPack: pack, seedVersion: 1 }).id
      )
    );

    expect(ids.size).toBeGreaterThan(1);
    ids.forEach((id) => expect(pack.items.some((item) => item.id === id)).toBe(true));
  });

  it("throws PromptPackEmptyError for empty packs", () => {
    const emptyPack = { ...pack, items: [] } as PromptPack;

    expect(() =>
      selectDailyChallengePrompt({
        localDate: "2026-02-24",
        promptPack: emptyPack,
        seedVersion: 1
      })
    ).toThrow(PromptPackEmptyError);
  });

  it("avoids the excluded prompt when more than one item exists", () => {
    const chosen = selectFreePracticePrompt({
      promptPack: pack,
      seed: 42,
      excludePromptId: "fixture_7"
    });

    expect(chosen.id).not.toBe("fixture_7");
  });

  it("is deterministic for free-practice selection when seed is provided", () => {
    const first = selectFreePracticePrompt({ promptPack: pack, seed: 999 });
    const second = selectFreePracticePrompt({ promptPack: pack, seed: 999 });

    expect(first.id).toBe(second.id);
  });
});
