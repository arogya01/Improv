import { z } from "zod";

import { DomainValidationError } from "./errors.js";
import type { PromptPack, RecordingMeta } from "./types.js";

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidLocalDate(value: string): boolean {
  if (!LOCAL_DATE_PATTERN.test(value)) {
    return false;
  }

  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

const isoDateTimeSchema = z.string().datetime({ offset: true }).or(z.string().datetime());

export const localDateSchema = z
  .string()
  .regex(LOCAL_DATE_PATTERN, "Expected YYYY-MM-DD format.")
  .refine(isValidLocalDate, "Invalid calendar date.");

export const promptItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  tags: z.array(z.string().min(1))
});

export const promptPackSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.number().int().min(1),
    items: z.array(promptItemSchema).min(1)
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();

    value.items.forEach((item, index) => {
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate prompt id "${item.id}" in pack "${value.id}".`,
          path: ["items", index, "id"]
        });
      }
      seen.add(item.id);
    });
  });

export const recordingSyncStatusSchema = z.enum([
  "local_only",
  "pending_upload",
  "uploading",
  "awaiting_finalize",
  "synced",
  "upload_failed",
  "pending_delete",
  "deleting_cloud",
  "delete_failed"
]);

export const recordingMetaSchema = z
  .object({
    id: z.string().min(1),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    localDate: localDateSchema,
    practiceMode: z.enum(["daily_challenge", "free_practice"]),
    mediaType: z.enum(["audio", "video"]),
    promptPackId: z.string().min(1),
    promptPackVersion: z.number().int().min(1),
    promptId: z.string().min(1),
    durationMs: z.number().int().min(0),
    timerTargetMs: z.literal(60000),
    mimeType: z.string().min(1),
    fileSizeBytes: z.number().int().min(0),
    isFavorite: z.boolean(),
    isDailyShare: z.boolean(),
    cameraFacing: z.enum(["user", "environment"]).optional(),
    videoWidth: z.number().int().positive().optional(),
    videoHeight: z.number().int().positive().optional(),
    localBlobKey: z.string().min(1),
    syncStatus: recordingSyncStatusSchema,
    ownerUserId: z.string().min(1).optional(),
    cloudObjectKey: z.string().min(1).optional(),
    cloudUploadedAt: isoDateTimeSchema.optional(),
    syncErrorCode: z.string().min(1).optional(),
    syncErrorMessage: z.string().min(1).optional()
  })
  .superRefine((value, ctx) => {
    if (value.mediaType === "audio") {
      if (value.cameraFacing) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "cameraFacing is only valid for video recordings.",
          path: ["cameraFacing"]
        });
      }
      if (typeof value.videoWidth === "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "videoWidth is only valid for video recordings.",
          path: ["videoWidth"]
        });
      }
      if (typeof value.videoHeight === "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "videoHeight is only valid for video recordings.",
          path: ["videoHeight"]
        });
      }
    }
  });

export function validateRecordingMeta(input: unknown): RecordingMeta {
  try {
    return recordingMetaSchema.parse(input) as RecordingMeta;
  } catch (error) {
    throw new DomainValidationError("Invalid recording metadata.", { cause: error });
  }
}

export function validatePromptPack(input: unknown): PromptPack {
  try {
    return promptPackSchema.parse(input) as PromptPack;
  } catch (error) {
    throw new DomainValidationError("Invalid prompt pack.", { cause: error });
  }
}
