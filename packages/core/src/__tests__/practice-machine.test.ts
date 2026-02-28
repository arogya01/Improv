import { describe, expect, it } from "vitest";

import { createPracticeSessionState, reducePracticeSession } from "../practice-machine.js";
import type { PromptItem } from "../types.js";

const prompt: PromptItem = {
  id: "prompt_01",
  text: "A suitcase with one wheel missing",
  tags: ["objects"]
};

describe("practice machine", () => {
  it("rejects START until prompt and media type are selected", () => {
    const initial = createPracticeSessionState();
    const next = reducePracticeSession(initial, { type: "START" });

    expect(next.status).toBe("idle");
    expect(next.lastInvalidTransition?.eventType).toBe("START");
  });

  it("transitions idle -> ready after valid setup", () => {
    const withPrompt = reducePracticeSession(createPracticeSessionState(), {
      type: "SELECT_PROMPT",
      prompt,
      promptPackId: "objects"
    });
    const ready = reducePracticeSession(withPrompt, {
      type: "SELECT_MEDIA_TYPE",
      mediaType: "audio"
    });

    expect(withPrompt.status).toBe("idle");
    expect(ready.status).toBe("ready");
  });

  it("transitions through recording lifecycle", () => {
    let state = createPracticeSessionState();
    state = reducePracticeSession(state, { type: "SELECT_PROMPT", prompt, promptPackId: "objects" });
    state = reducePracticeSession(state, { type: "SELECT_MEDIA_TYPE", mediaType: "video" });
    state = reducePracticeSession(state, { type: "SELECT_CAMERA", cameraFacing: "user" });

    expect(state.status).toBe("ready");

    state = reducePracticeSession(state, { type: "START" });
    expect(state.status).toBe("recording");

    state = reducePracticeSession(state, { type: "TICK", deltaMs: 1234 });
    expect(state.elapsedMs).toBe(1234);
    expect(state.remainingMs).toBe(60000 - 1234);

    state = reducePracticeSession(state, { type: "TIME_UP" });
    expect(state.status).toBe("stopping");
    expect(state.remainingMs).toBe(0);

    state = reducePracticeSession(state, { type: "STOPPED" });
    expect(state.status).toBe("saving");

    state = reducePracticeSession(state, { type: "SAVE_OK" });
    expect(state.status).toBe("saved");
  });

  it("moves saving -> error on SAVE_ERR", () => {
    let state = createPracticeSessionState();
    state = reducePracticeSession(state, { type: "SELECT_PROMPT", prompt });
    state = reducePracticeSession(state, { type: "SELECT_MEDIA_TYPE", mediaType: "audio" });
    state = reducePracticeSession(state, { type: "START" });
    state = reducePracticeSession(state, { type: "TIME_UP" });
    state = reducePracticeSession(state, { type: "STOPPED" });
    state = reducePracticeSession(state, { type: "SAVE_ERR", message: "Disk full" });

    expect(state.status).toBe("error");
    expect(state.lastErrorMessage).toBe("Disk full");
  });

  it("reset returns to idle state", () => {
    let state = createPracticeSessionState();
    state = reducePracticeSession(state, { type: "SELECT_PROMPT", prompt });
    state = reducePracticeSession(state, { type: "SELECT_MEDIA_TYPE", mediaType: "audio" });
    state = reducePracticeSession(state, { type: "RESET" });

    expect(state.status).toBe("idle");
    expect(state.prompt).toBeNull();
  });
});
