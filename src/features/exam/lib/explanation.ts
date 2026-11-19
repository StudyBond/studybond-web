/**
 * Splits an explanation into what the review shows:
 *
 * - `lead`: the whole opening paragraph, for the amber answer line. Never a
 *   slice of it: cutting at the first full stop broke on "p.d.", "a.c." and
 *   "1.6 x 10".
 * - `blocks`: "The working", with the lead taken out so it is never printed
 *   twice. "**Step 2: ...**" opens a numbered block whose number comes from
 *   the text, never from a counter, so a step is never shown as the wrong
 *   number. "**Building the formula.**" and the other setting-up headings
 *   open a block with no number.
 *
 * Pure text in, plain data out. The text is still Markdown with maths; the
 * review renders each piece with MathMarkdown.
 */

export type ExplanationBlock =
  | { kind: "text"; body: string }
  | { kind: "step"; num: string | null; label: string; body: string };

export type SplitExplanation = {
  lead: string | null;
  blocks: ExplanationBlock[];
};

const STEP = /^\*\*Step\s*(\d+)\s*[:.]?\s*(.*?)\*\*\s*(.*)$/i;
const SETUP = /^\*\*(Building the formula|The formula|Setting it up|Set(?:ting)? up)\s*[:.]?\s*\*\*\s*(.*)$/i;
const HEADING = /^#{1,4}\s+/;

/** Lines that open a structure, not a sentence: not fit for the answer line. */
const NOT_PROSE = /^(?:\*\*Step\s*\d|\$\$|\\\[|\||#{1,4}\s|>|[-*+]\s|\d+[.)]\s|!\[)/i;

/** Splits on blank lines, but never inside a $$ ... $$ block. */
export function paragraphs(markdown: string): string[] {
  const out: string[] = [];
  let current: string[] = [];
  let inMath = false;
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (!inMath && line.trim() === "") {
      if (current.length) out.push(current.join("\n"));
      current = [];
      continue;
    }
    current.push(line);
    const fences = line.match(/\$\$/g)?.length ?? 0;
    if (fences % 2 === 1) inMath = !inMath;
  }
  if (current.length) out.push(current.join("\n"));
  return out;
}

function stepLabel(head: string): string {
  const label = head.trim().replace(/[:.]\s*$/, "").trim();
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Cuts the working into plain blocks and step blocks. */
export function workingBlocks(markdown: string): ExplanationBlock[] {
  const blocks: ExplanationBlock[] = [];
  let lines: string[] = [];
  let step: { num: string | null; label: string } | null = null;
  let inMath = false;

  const flush = () => {
    const body = lines.join("\n").trim();
    if (step) blocks.push({ kind: "step", num: step.num, label: step.label, body });
    else if (body) blocks.push({ kind: "text", body });
    lines = [];
    step = null;
  };

  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const trimmed = line.trim();
    if (!inMath) {
      const s = trimmed.match(STEP);
      const u = s ? null : trimmed.match(SETUP);
      if (s || u) {
        flush();
        step = s ? { num: s[1], label: stepLabel(s[2]) } : { num: null, label: stepLabel(u![1]) };
        const rest = (s ? s[3] : u![2]).trim();
        if (rest) lines.push(rest);
        continue;
      }
      // A heading ends a step; what follows is plain again.
      if (step && HEADING.test(trimmed)) {
        flush();
      }
    }
    lines.push(line);
    const fences = line.match(/\$\$/g)?.length ?? 0;
    if (fences % 2 === 1) inMath = !inMath;
  }
  flush();
  return blocks;
}

export function splitExplanation(text: string | null | undefined): SplitExplanation {
  const all = paragraphs(text ?? "");
  if (all.length === 0) return { lead: null, blocks: [] };

  const first = all[0].trim();
  if (NOT_PROSE.test(first) || SETUP.test(first)) {
    // It opens with working, not with the answer: show it all as working.
    return { lead: null, blocks: workingBlocks(all.join("\n\n")) };
  }
  return { lead: first, blocks: workingBlocks(all.slice(1).join("\n\n")) };
}

/* $$...$$, $...$, \(...\) and \[...\]: maths, where HTML would break KaTeX. */
const MATH_SPAN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/;
const MARKER = /\{\{\s*([A-E])\s*\}\}/g;

/**
 * Draws each {{B}} option marker as a small badge: `<span class="...">B</span>`.
 * MathMarkdown keeps a span's class, so the badge survives. Inside maths a
 * marker becomes the plain letter instead. Text without markers (an older
 * backend's plain letters) comes back unchanged.
 */
export function badgeOptionMarkers(markdown: string, className: string): string {
  if (!markdown.includes("{{")) return markdown;
  return markdown
    .split(MATH_SPAN)
    .map((part, k) =>
      k % 2 === 1
        ? part.replace(MARKER, "$1")
        : part.replace(MARKER, (_m, letter: string) => `<span class="${className}">${letter}</span>`),
    )
    .join("");
}
