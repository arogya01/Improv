import type { RecordingMeta } from "@improv/core";

import type { ImprovDatabase } from "../database";
import type { RecordingListFilters, RecordingRepository } from "../schema";

export class DexieRecordingRepository implements RecordingRepository {
  constructor(private readonly database: ImprovDatabase) {}

  async put(recording: RecordingMeta): Promise<void> {
    await this.database.recordings.put(recording);
  }

  async getById(recordingId: string): Promise<RecordingMeta | undefined> {
    return this.database.recordings.get(recordingId);
  }

  async list(filters: RecordingListFilters = {}): Promise<RecordingMeta[]> {
    let collection = this.database.recordings.toCollection();

    if (filters.localDate) {
      collection = this.database.recordings.where("localDate").equals(filters.localDate);
    }

    if (typeof filters.isFavorite === "boolean") {
      collection = collection.and((recording) => recording.isFavorite === filters.isFavorite);
    }

    if (filters.syncStatus) {
      collection = collection.and((recording) => recording.syncStatus === filters.syncStatus);
    }

    const sorted = (await collection.sortBy("updatedAt")).sort((left, right) => {
      const updatedAtCompare = right.updatedAt.localeCompare(left.updatedAt);
      if (updatedAtCompare !== 0) {
        return updatedAtCompare;
      }
      return left.id.localeCompare(right.id);
    });

    if (typeof filters.limit === "number") {
      return sorted.slice(0, Math.max(filters.limit, 0));
    }

    return sorted;
  }

  async deleteById(recordingId: string): Promise<void> {
    await this.database.recordings.delete(recordingId);
  }

  async updateFavorite(recordingId: string, isFavorite: boolean, updatedAt: string): Promise<boolean> {
    const recording = await this.database.recordings.get(recordingId);
    if (!recording) {
      return false;
    }

    await this.database.recordings.put({
      ...recording,
      isFavorite,
      updatedAt
    });

    return true;
  }
}
