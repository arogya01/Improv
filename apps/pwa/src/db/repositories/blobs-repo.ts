import type { ImprovDatabase } from "../database";
import type { BlobRepository, PutBlobInput } from "../schema";

export class DexieBlobRepository implements BlobRepository {
  constructor(private readonly database: ImprovDatabase) {}

  async put(input: PutBlobInput): Promise<void> {
    const recording = await this.database.recordings.get(input.recordingId);

    if (!recording) {
      throw new Error(`Cannot store blob for missing recording "${input.recordingId}".`);
    }

    if (recording.localBlobKey !== input.key) {
      throw new Error(
        `Blob key "${input.key}" does not match recording.localBlobKey "${recording.localBlobKey}".`
      );
    }

    await this.database.blobs.put({
      key: input.key,
      recordingId: input.recordingId,
      blob: input.blob,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt
    });
  }

  async getByKey(key: string) {
    return this.database.blobs.get(key);
  }

  async deleteByKey(key: string): Promise<void> {
    await this.database.blobs.delete(key);
  }

  async deleteByRecordingId(recordingId: string): Promise<void> {
    await this.database.blobs.where("recordingId").equals(recordingId).delete();
  }
}
