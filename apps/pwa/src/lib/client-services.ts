import { createImprovDatabase } from "../db";
import { LibraryService } from "../features/library/library-service";
import { SyncQueueService } from "../features/sync/sync-queue-service";

export const improvDatabase = createImprovDatabase();
export const libraryService = new LibraryService(improvDatabase);
export const syncQueueService = new SyncQueueService(improvDatabase);
