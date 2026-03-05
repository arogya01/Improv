import React, { useEffect, useRef, useState } from "react";
import "./BottomSheet.css";

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
    }, 300); // match transition
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`primitive-bottom-sheet__overlay ${isClosing ? "is-closing" : "is-open"}`}
      onClick={handleClose}
    >
      <div
        ref={sheetRef}
        className={`primitive-bottom-sheet__content ${isClosing ? "is-closing" : "is-open"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="primitive-bottom-sheet__drag-handle"
          onClick={handleClose}
        >
          <div className="primitive-bottom-sheet__dragger" />
        </div>

        {title && (
          <div className="primitive-bottom-sheet__header">
            <h3 className="primitive-bottom-sheet__title">{title}</h3>
          </div>
        )}

        <div className="primitive-bottom-sheet__body">{children}</div>
      </div>
    </div>
  );
};
