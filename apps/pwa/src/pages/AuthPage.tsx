import React from "react";
import { motion } from "framer-motion";

import { Button, Card, Chip } from "../components/primitives";

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen grid place-items-center p-6 px-4 bg-[radial-gradient(circle_at_20%_16%,color-mix(in_srgb,var(--teal-300)_10%,transparent)_0,transparent_30%),radial-gradient(circle_at_82%_14%,color-mix(in_srgb,var(--indigo-200)_8%,transparent)_0,transparent_26%),transparent]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="w-full max-w-[620px] grid gap-4 p-[clamp(1.5rem,4vw,2.5rem)]">
          <Chip variant="info">Deferred</Chip>
          <h2 className="m-0 font-headline text-[clamp(2rem,5vw,3.4rem)] leading-none tracking-tighter">
            Authentication arrives in the backend phase
          </h2>
          <p className="m-0 text-ink-700 leading-relaxed">
            This client build is intentionally local-first. Sign-in, cloud
            backup, and sync APIs will plug in after the frontend UX is
            finalized.
          </p>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};
