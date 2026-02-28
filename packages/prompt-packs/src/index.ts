import type { PromptPack } from "@improv/core";

import emotionsPackJson from "./packs/emotions.json";
import objectsPackJson from "./packs/objects.json";
import placesPackJson from "./packs/places.json";
import relationshipsPackJson from "./packs/relationships.json";

export const objectsPromptPack = objectsPackJson as PromptPack;
export const emotionsPromptPack = emotionsPackJson as PromptPack;
export const placesPromptPack = placesPackJson as PromptPack;
export const relationshipsPromptPack = relationshipsPackJson as PromptPack;

export const allPromptPacks: PromptPack[] = [
  objectsPromptPack,
  emotionsPromptPack,
  placesPromptPack,
  relationshipsPromptPack
];

export const promptPacksById = new Map(allPromptPacks.map((pack) => [pack.id, pack]));
