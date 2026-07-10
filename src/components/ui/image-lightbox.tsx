"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type ImageLightboxProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

/**
 * Fullscreen image lightbox overlay.
 * Opens with a smooth fade-in / zoom-in animation.
 * Closes on backdrop click, close button, or Escape key.
 */
export function ImageLightbox({ src, alt = "Image", onClose }: ImageLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  // Lock body scroll + listen for Escape
  useEffect(() => {
    if (!src) return;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [src, handleKeyDown]);

  if (!src) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-white/60 transition-all hover:bg-white/[0.15] hover:text-white"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="relative z-[1] max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200 sb-protected-img"
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
