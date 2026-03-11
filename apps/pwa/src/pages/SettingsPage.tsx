import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Button, Card, Chip } from "../components/primitives";
import { improvDatabase, syncQueueService } from "../lib/client-services";

type StorageSnapshot = {
  quotaBytes: number | undefined;
  usedBytes: number | undefined;
};

type QueueSnapshot = {
  total: number;
  dueNow: number;
  upload: number;
  finalizeUpload: number;
  deleteCloud: number;
};

function formatMegabytes(bytes?: number): string {
  if (bytes === undefined) {
    return "Unavailable";
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SettingsPage: React.FC = () => {
  const [storage, setStorage] = useState<StorageSnapshot>({
    quotaBytes: undefined,
    usedBytes: undefined,
  });
  const [queue, setQueue] = useState<QueueSnapshot>({
    total: 0,
    dueNow: 0,
    upload: 0,
    finalizeUpload: 0,
    deleteCloud: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshDiagnostics = useCallback(async () => {
    setLoading(true);

    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      setStorage({ quotaBytes: estimate.quota, usedBytes: estimate.usage });
    }

    const allItems = await improvDatabase.syncQueue.toArray();
    const dueNow = await syncQueueService.listDueItems(
      new Date().toISOString(),
      1000,
    );

    setQueue({
      total: allItems.length,
      dueNow: dueNow.length,
      upload: allItems.filter((item) => item.kind === "upload").length,
      finalizeUpload: allItems.filter((item) => item.kind === "finalize_upload")
        .length,
      deleteCloud: allItems.filter((item) => item.kind === "delete_cloud")
        .length,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics]);

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto min-h-[calc(100vh-76px)] p-[clamp(2rem,4vw,3rem)] px-4 pb-[calc(112px+env(safe-area-inset-bottom))] grid gap-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex justify-between gap-4 items-start max-[700px]:flex-col border-b border-gray-200/60 pb-8">
        <div>
          <h2 className="m-0 font-headline text-[clamp(2.6rem,5vw,4.4rem)] font-medium tracking-tight leading-none text-gray-900">
            Settings
          </h2>
          <p className="mt-4 mb-0 text-gray-600 font-ui text-lg leading-relaxed max-w-[52ch]">
            Storage & sync diagnostics.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={refreshDiagnostics}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="grid gap-5 rounded-[24px] bg-white/50 border border-gray-200/50 p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <h3 className="m-0 font-headline text-[1.6rem] leading-tight font-medium tracking-tight text-gray-900">
              Storage
            </h3>
            <Chip variant="default" className="shrink-0">
              Local
            </Chip>
          </div>

          <div className="flex justify-between gap-2 text-[0.95rem] pb-3 border-b border-gray-200/60 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Used</span>
            <strong>{formatMegabytes(storage.usedBytes)}</strong>
          </div>
          <div className="flex justify-between gap-2 text-[0.95rem] py-1 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Quota</span>
            <strong>{formatMegabytes(storage.quotaBytes)}</strong>
          </div>
        </Card>

        <Card className="grid gap-4 rounded-[24px] bg-white/50 border border-gray-200/50 p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3 mb-2">
            <h3 className="m-0 font-headline text-[1.6rem] leading-tight font-medium tracking-tight text-gray-900">
              Sync Queue
            </h3>
            <Chip
              variant={queue.total > 0 ? "warning" : "success"}
              className="shrink-0"
            >
              {queue.total > 0 ? "Pending" : "Idle"}
            </Chip>
          </div>

          <div className="flex justify-between gap-2 text-[0.95rem] pb-3 border-b border-gray-200/60 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Total items</span>
            <strong>{queue.total}</strong>
          </div>
          <div className="flex justify-between gap-2 text-[0.95rem] pb-3 border-b border-gray-200/60 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Due now</span>
            <strong>{queue.dueNow}</strong>
          </div>
          <div className="flex justify-between gap-2 text-[0.95rem] pb-3 border-b border-gray-200/60 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Upload</span>
            <strong>{queue.upload}</strong>
          </div>
          <div className="flex justify-between gap-2 text-[0.95rem] pb-3 border-b border-gray-200/60 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Finalize upload</span>
            <strong>{queue.finalizeUpload}</strong>
          </div>
          <div className="flex justify-between gap-2 text-[0.95rem] py-1 font-ui text-gray-900">
            <span className="text-gray-500 font-medium">Delete cloud</span>
            <strong>{queue.deleteCloud}</strong>
          </div>
        </Card>

        <Card className="grid gap-4 rounded-[24px] bg-white/50 border border-gray-200/50 p-6 shadow-sm">
          <div className="flex justify-between items-start gap-3">
            <h3 className="m-0 font-headline text-[1.6rem] leading-tight font-medium tracking-tight text-gray-900">
              Cloud Backup
            </h3>
            <Chip
              variant="info"
              className="shrink-0 bg-gray-100 text-gray-600 border-none"
            >
              Coming Soon
            </Chip>
          </div>

          <p className="m-0 text-gray-600 font-ui leading-relaxed">
            Cloud auth and background upload will be layered in next.
            Local-first recording and playback already work without any backend
            dependency.
          </p>
        </Card>
      </div>
    </motion.div>
  );
};
