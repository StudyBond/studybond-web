"use client";

import { MathMarkdown } from "@/components/ui/math-markdown";
import { MediaNode, isVideoUrl } from "@/features/exam/components/answer-review";
import { badgeOptionMarkers, splitExplanation } from "@/features/exam/lib/explanation";
import { cn } from "@/lib/utils/cn";

import s from "./results.module.css";

type ExplanationViewProps = {
  /** Plain letters ("That is option D"). */
  text: string | null | undefined;
  /** The same with {{D}} markers kept; preferred when the backend sends it. */
  markedText?: string | null;
  /** The correct option's letter, shown in the answer line. */
  correct: string;
  imageUrl?: string | null;
  /**
   * The sentence part of the question's note ("**Time check:** ..."), from
   * splitNote. Its paper-and-year tag is shown by the card's grey line.
   */
  remark?: string | null;
  onZoom: (src: string) => void;
};

/**
 * The explanation in the review: an amber answer line holding the whole
 * opening paragraph, then "The working" with that paragraph taken out, so
 * it is never printed twice. Steps carry the number written in the text.
 * Option letters written as {{D}} show as small badges in the paper colour.
 */
export function ExplanationView({
  text: plainText,
  markedText,
  correct,
  imageUrl,
  remark,
  onZoom,
}: ExplanationViewProps) {
  const text = markedText ?? plainText;
  const md = (source: string) => badgeOptionMarkers(source, s.okey);

  if (!text && !imageUrl && !remark) {
    return (
      <section className={s.why}>
        <p className={s.none}>There is no explanation for this question yet.</p>
      </section>
    );
  }

  const { lead, blocks } = splitExplanation(text);
  const media = imageUrl ? (
    isVideoUrl(imageUrl) ? (
      <MediaNode url={imageUrl} alt="Explanation" className={s.media} />
    ) : (
      <button type="button" className={s.zoomable} onClick={() => onZoom(imageUrl)} aria-label="Enlarge the picture">
        <MediaNode url={imageUrl} alt="Picture for the explanation" className={s.media} />
      </button>
    )
  ) : null;

  return (
    <section className={s.why} aria-label="Explanation">
      {lead ? (
        <div className={s.whyLine}>
          <span className={s.whyKey} aria-label={`Answer ${correct}`}>
            {correct}
          </span>
          <div className={cn(s.whyText, "sb-protected")}>
            <MathMarkdown content={md(lead)} variant="explanation" />
          </div>
        </div>
      ) : null}

      {blocks.length > 0 || media ? (
        <>
          <h3>The working</h3>
          <div className={cn(s.md, "sb-protected")}>
            {blocks.map((b, k) =>
              b.kind === "text" ? (
                <MathMarkdown key={k} content={md(b.body)} variant="explanation" />
              ) : (
                <div key={k} className={cn(s.step, !b.num && s.stepFree)}>
                  {b.num ? (
                    <span className={s.stepN} aria-label={`Step ${b.num}`}>
                      {b.num}
                    </span>
                  ) : null}
                  {b.label ? (
                    <div className={s.stepH}>
                      <MathMarkdown content={md(b.label)} variant="option" />
                    </div>
                  ) : null}
                  {b.body ? (
                    <div>
                      <MathMarkdown content={md(b.body)} variant="explanation" />
                    </div>
                  ) : null}
                </div>
              ),
            )}
            {media}
          </div>
        </>
      ) : null}

      {/* No box: the same text style as the working, with its lead-in in bold. */}
      {remark ? (
        <div className={cn(s.md, s.remark, "sb-protected")}>
          <MathMarkdown content={md(remark)} variant="explanation" />
        </div>
      ) : null}
    </section>
  );
}
