import { describe, expect, it } from "vitest";

import { validatePromptPack } from "@improv/core";

import { allPromptPacks } from "../index.js";

describe("bundled prompt packs", () => {
  it("all bundled packs validate", () => {
    for (const pack of allPromptPacks) {
      expect(() => validatePromptPack(pack)).not.toThrow();
    }
  });

  it("pack ids are unique across bundles", () => {
    const ids = allPromptPacks.map((pack) => pack.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prompt ids are unique within each pack", () => {
    for (const pack of allPromptPacks) {
      const itemIds = pack.items.map((item) => item.id);
      expect(new Set(itemIds).size).toBe(itemIds.length);
    }
  });

  it("each pack contains at least 25 prompts", () => {
    for (const pack of allPromptPacks) {
      expect(pack.items.length).toBeGreaterThanOrEqual(25);
    }
  });
});
