import type { RouletteTopic } from "./types";

type PickRandomTopicOptions = {
  recentIds?: readonly string[];
  recentWindow?: number;
  seed?: string | number;
};

function hashSeed(seed: string | number): number {
  const value = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: string | number): () => number {
  let state = hashSeed(seed) || 0x6d2b79f5;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) & 0xffffffff) / 0x100000000;
  };
}

function systemRandom(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return (value[0] ?? 0) / 0x100000000;
  }

  return Math.random();
}

export function pickRandomTopic(
  deck: readonly RouletteTopic[],
  options: PickRandomTopicOptions = {}
): RouletteTopic {
  if (deck.length === 0) {
    throw new Error("Cannot pick a random topic from an empty deck.");
  }

  const windowSize = Math.max(0, options.recentWindow ?? 5);
  const recent = new Set((options.recentIds ?? []).slice(-windowSize));

  const candidates =
    recent.size >= deck.length
      ? [...deck]
      : deck.filter((topic) => !recent.has(topic.id));

  const random = options.seed === undefined ? systemRandom() : seededRandom(options.seed)();
  const index = Math.min(candidates.length - 1, Math.floor(random * candidates.length));
  const selected = candidates[index] ?? candidates[0] ?? deck[0];
  if (!selected) {
    throw new Error("Failed to pick a random topic.");
  }

  return selected;
}

export function buildSpinSequence(
  deck: readonly RouletteTopic[],
  target: RouletteTopic,
  cycles = 20,
  seed?: string | number
): RouletteTopic[] {
  const random = optionsRandom(seed);
  const sequence: RouletteTopic[] = [];

  for (let index = 0; index < Math.max(cycles, 8); index += 1) {
    const next = deck[Math.floor(random() * deck.length)] ?? target;
    sequence.push(next);
  }

  sequence.push(target);
  return sequence;
}

function optionsRandom(seed?: string | number): () => number {
  if (seed === undefined) {
    return systemRandom;
  }

  return seededRandom(seed);
}
