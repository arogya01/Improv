import { PromptPackEmptyError } from "./errors.js";
import { cyrb53, mulberry32, pickIndex, toSeed32 } from "./random.js";
import { localDateSchema, validatePromptPack } from "./schemas.js";
import type { PromptItem, PromptPack } from "./types.js";

export type SelectDailyChallengePromptInput = {
  localDate: string;
  promptPack: PromptPack;
  seedVersion: number;
};

export type SelectFreePracticePromptInput = {
  promptPack: PromptPack;
  seed?: number;
  excludePromptId?: string;
};

function assertPackHasItems(promptPack: PromptPack): void {
  if (promptPack.items.length === 0) {
    throw new PromptPackEmptyError();
  }
}

function createSeededRandomFromString(input: string): () => number {
  return mulberry32(toSeed32(cyrb53(input)));
}

export function selectDailyChallengePrompt(input: SelectDailyChallengePromptInput): PromptItem {
  const localDate = localDateSchema.parse(input.localDate);
  assertPackHasItems(input.promptPack);
  const promptPack = validatePromptPack(input.promptPack);

  const seedKey = `${localDate}:${promptPack.id}:${input.seedVersion}`;
  const random = createSeededRandomFromString(seedKey);
  const index = pickIndex(promptPack.items.length, random);

  return promptPack.items[index]!;
}

export function selectFreePracticePrompt(input: SelectFreePracticePromptInput): PromptItem {
  assertPackHasItems(input.promptPack);
  const promptPack = validatePromptPack(input.promptPack);

  const random =
    typeof input.seed === "number" ? mulberry32(toSeed32(input.seed)) : Math.random;

  let index = pickIndex(promptPack.items.length, random);
  const chosen = promptPack.items[index]!;

  if (
    input.excludePromptId &&
    promptPack.items.length > 1 &&
    chosen.id === input.excludePromptId
  ) {
    const excludeIndex = promptPack.items.findIndex((item) => item.id === input.excludePromptId);
    if (excludeIndex >= 0) {
      const nextIndex = (excludeIndex + 1 + pickIndex(promptPack.items.length - 1, random)) % promptPack.items.length;
      index = nextIndex;
    }
  }

  return promptPack.items[index]!;
}
