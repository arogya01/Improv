import { create } from "zustand";
import { allPromptPacks } from "@improv/prompt-packs";
import type { CameraFacing, MediaType, PromptItem } from "@improv/core";
import type { PracticeSetupDraft } from "./types";

export const defaultSetupDraft: PracticeSetupDraft = {
    promptPackId: allPromptPacks[0]?.id || null,
    prompt: null, // User can select one later, or it stays null if they don't want a specific prompt
    mediaType: "video",
    cameraFacing: "user",
};

interface PracticeSetupState {
    draft: PracticeSetupDraft;
    updateDraft: (updates: Partial<PracticeSetupDraft>) => void;
    setPromptPackId: (packId: string) => void;
    setPrompt: (prompt: PromptItem | null) => void;
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
            draft: { ...state.draft, promptPackId: packId, prompt: null },
        })),
    setPrompt: (prompt) =>
        set((state) => ({ draft: { ...state.draft, prompt } })),
    setMediaType: (mediaType) =>
        set((state) => ({ draft: { ...state.draft, mediaType } })),
    setCameraFacing: (facing) =>
        set((state) => ({ draft: { ...state.draft, cameraFacing: facing } })),
    reset: () => set({ draft: { ...defaultSetupDraft } }),
}));
