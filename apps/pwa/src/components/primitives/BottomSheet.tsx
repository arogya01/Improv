import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/40 will-change-[opacity]",
        isClosing ? "animate-overlay-fade-out" : "animate-overlay-fade-in",
      )}
      onClick={handleClose}
    >
      <div
        ref={sheetRef}
        className={cn(
          "absolute bottom-0 left-0 right-0 max-h-[90vh] flex flex-col bg-[var(--surface-muted)] border-t border-[var(--line-soft)] rounded-t-[32px] shadow-ethereal-xl will-change-transform",
          isClosing ? "animate-sheet-slide-down" : "animate-sheet-slide-up",
          "motion-reduce:[animation-duration:0.12s]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full py-3 flex justify-center items-center cursor-grab active:cursor-grabbing"
          onClick={handleClose}
        >
          <div className="w-12 h-[5px] rounded-full bg-[color-mix(in_srgb,var(--ink-900)_14%,transparent)]" />
        </div>

        {title && (
          <div className="px-6 pb-4 text-center">
            <h3 className="m-0 font-headline text-2xl font-medium text-ink-900 tracking-tight">
              {title}
            </h3>
          </div>
        )}

        <div className="px-6 pb-8 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
