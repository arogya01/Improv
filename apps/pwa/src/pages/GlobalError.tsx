import React from "react";
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { EtherealBackground } from "../components/effects/EtherealBackground";
import { Button } from "../components/primitives/Button";

export const GlobalError: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred.";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Handle specific 404 text
  const is404 = errorStatus === 404;
  const displayTitle = is404 ? "Route Not Found" : "Application Error";
  const displayMessage = is404
    ? "The ethereal path you are looking for has faded into the void."
    : errorMessage;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-transparent text-ink-900 font-ui overflow-hidden selection:bg-teal-100">
      <EtherealBackground />

      <div className="z-10 flex flex-col items-center justify-center text-center px-6 perspective-[1000px]">
        <motion.div
          className="relative max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl shadow-ethereal-lg overflow-hidden flex flex-col items-center justify-center p-10 gap-6"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Status Code Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] font-space font-bold text-ink-500/5 select-none pointer-events-none z-0">
            {errorStatus}
          </div>

          <div className="relative z-10 flex flex-col gap-2 items-center text-center">
            <h1 className="font-space text-2xl font-medium tracking-tight text-ink-900">
              {displayTitle}
            </h1>
            <p className="text-ink-600 text-sm leading-relaxed max-w-[280px]">
              {displayMessage}
            </p>
          </div>

          <div className="relative z-10 flex gap-4 w-full mt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Return Home
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 w-full flex justify-center z-10 text-[0.6rem] font-mono tracking-widest text-ink-400 uppercase">
        <span>System Restoring</span>
      </div>
    </div>
  );
};
