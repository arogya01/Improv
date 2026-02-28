import { describe, expect, it } from "vitest";

import { buildShareText } from "../share-text.js";

describe("share text", () => {
  it("builds a daily-share message in stable order", () => {
    expect(
      buildShareText({
        promptText: "A cracked coffee mug that someone refuses to throw away",
        localDate: "2026-02-24",
        isDailyShare: true
      })
    ).toBe(
      [
        "Improv of the day",
        "Prompt: A cracked coffee mug that someone refuses to throw away",
        "Date: 2026-02-24"
      ].join("\n")
    );
  });

  it("builds a free-practice message in stable order", () => {
    expect(
      buildShareText({
        promptText: "Relief that arrives one minute too late",
        localDate: "2026-02-24"
      })
    ).toBe(
      ["Improv practice", "Prompt: Relief that arrives one minute too late", "Date: 2026-02-24"].join(
        "\n"
      )
    );
  });
});
