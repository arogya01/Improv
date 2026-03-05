import { create } from "zustand";
import type { CameraFacing, MediaType, PromptItem } from "@improv/core";

import type { RouletteTopic } from "../topics";
import type { PracticeSetupDraft } from "./types";

function topicToPromptItem(topic: RouletteTopic): PromptItem {
  return {
    id: topic.id,
    text: topic.text,
    tags: topic.tags
  };
}

export const defaultSetupDraft: PracticeSetupDraft = {
  promptPackId: "roulette-v1",
  prompt: null,
  selectedTopic: null,
  mediaType: "video",
  cameraFacing: "user"
};

interface PracticeSetupState {
  draft: PracticeSetupDraft;
  updateDraft: (updates: Partial<PracticeSetupDraft>) => void;
  setPromptPackId: (packId: string) => void;
  setPrompt: (prompt: PromptItem | null) => void;
  setSelectedTopic: (topic: RouletteTopic | null) => void;
  setMediaType: (mediaType: MediaType) => void;
  setCameraFacing: (facing: CameraFacing) => void;
  reset: () => void;
}

export const usePracticeSetup = create<PracticeSetupState>((set) => ({
  draft: { ...defaultSetupDraft },
  updateDraft: (updates) =>
    set((state) => ({ draft: { ...state.draft, ...updates } })),
  setPromptPackId: (packId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        promptPackId: packId
      }
    })),
  setPrompt: (prompt) =>
    set((state) => ({
      draft: {
        ...state.draft,
        prompt,
        selectedTopic: prompt
          ? {
              id: prompt.id,
              text: prompt.text,
              category: "situations",
              tags: prompt.tags
            }
          : null
      }
    })),
  setSelectedTopic: (topic) =>
    set((state) => ({
      draft: {
        ...state.draft,
        selectedTopic: topic,
        prompt: topic ? topicToPromptItem(topic) : null,
        promptPackId: "roulette-v1"
      }
    })),
  setMediaType: (mediaType) =>
    set((state) => ({
      draft: {
        ...state.draft,
        mediaType,
        cameraFacing: mediaType === "video" ? state.draft.cameraFacing ?? "user" : null
      }
    })),
  setCameraFacing: (facing) =>
    set((state) => ({
      draft: {
        ...state.draft,
        cameraFacing: facing
      }
    })),
  reset: () => set({ draft: { ...defaultSetupDraft } })
}));
