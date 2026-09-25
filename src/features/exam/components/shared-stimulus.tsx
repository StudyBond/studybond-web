"use client";

import { cn } from "@/lib/utils/cn";
import { MathMarkdown } from "@/components/ui/math-markdown";

type SharedStimulusProps = {
  text: string | null | undefined;
  imageUrl: string | null | undefined;
  /** Smaller, quieter box for the answer review list. */
  compact?: boolean;
  onImageClick?: (src: string) => void;
};

/**
 * The diagram or passage that several questions share. It carries its own
 * instruction ("Use the diagram below to answer question 21 to 23"), so this
 * box adds no heading. Shows whichever of the text and the picture exists.
 */
export function SharedStimulus({ text, imageUrl, compact = false, onImageClick }: SharedStimulusProps) {
  if (!text && !imageUrl) return null;

  const image = imageUrl ? (
    <img
      src={imageUrl}
      alt="Diagram for this question"
      className={cn(
        "rounded-xl border border-white/[0.06] object-contain sb-protected-img",
        compact ? "max-h-48" : "max-h-64",
        text ? "mt-4" : "",
        onImageClick && "cursor-pointer transition-opacity hover:opacity-80",
      )}
      loading="lazy"
      onContextMenu={(e) => e.preventDefault()}
      onClick={onImageClick ? () => onImageClick(imageUrl) : undefined}
      draggable={false}
    />
  ) : null;

  return (
    <div
      className={cn(
        "sb-protected",
        compact
          ? "rounded-xl border-l-2 border-white/10 bg-white/[0.02] p-3.5 text-xs text-white/50 sm:p-4"
          : "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6",
      )}
    >
      {text ? (
        <div className={compact ? undefined : "text-sm leading-[1.8] text-white/70"}>
          <MathMarkdown content={text} />
        </div>
      ) : null}
      {image}
    </div>
  );
}
