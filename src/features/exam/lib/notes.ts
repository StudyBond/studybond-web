/**
 * Splits an explanation's `additionalNotes` into the two things the review
 * shows, as the approved mockup does:
 *
 * - `tag`: which paper the question came from ("JAMB UTME 2021 · also asked
 *   in 2004", "UI Post UTME 2022/23 · Nursing aspirants question"). It goes in
 *   the small grey line under the question, next to the time spent, where the
 *   mockup prints "JAMB 2000". The word "Source:" is dropped.
 * - `remark`: a real sentence for the student ("Time check: ...", "Note:
 *   ..."). It goes after the working as a plain paragraph with a bold
 *   lead-in, never as a tag, because a long sentence in the grey line reads
 *   as small print.
 *
 * Almost every note in the bank is a tag alone. A note that does not open
 * with a recognisable tag is all remark, so nothing a writer meant students
 * to read is ever shrunk into the grey line.
 *
 * Pure text in, plain data out.
 */

export type NoteParts = {
  tag: string | null;
  /** Markdown, with its lead-in already in bold. */
  remark: string | null;
};

/** A year, alone or as a session: 2021, 2022/23, 2023/24. */
const YEAR = /\b(?:19|20)\d{2}(?:\/\d{2,4})?\b/;
/** Sentence end followed by more text: "2021. Also". */
const MID_SENTENCE = /[.!?]\s+\S/;
/** The paper's name: "UI Post UTME Biology 2019", "JAMB UTME 2021". */
const MAX_HEAD = 60;
/** A short label after it: "Nursing aspirants question", "Fill-in-the-gap". */
const MAX_LABEL = 45;
/** The one "label: value" the bank uses as a tag (English passages). */
const GENRE = /^passage genre\s*:\s*\S/i;
/** Lead-ins writers use for a remark; shown in bold. */
const LEAD = /^(note|time check|n\.\s?b\.?|nb|tip|remember|caution)\s*:\s*/i;

const trimStop = (s: string) => s.trim().replace(/\.$/, "").trim();
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** The paper's name, which carries a year. */
function isHead(piece: string): boolean {
  const p = trimStop(piece);
  return !!p && p.length <= MAX_HEAD && !p.includes("\n") && !p.includes(":") && !MID_SENTENCE.test(p) && YEAR.test(p);
}

/**
 * A short label, not a sentence. Anything longer, ending in a full stop or
 * written as "Something: ..." is a remark, so a writer's sentence is never
 * shrunk into the grey line.
 */
function isLabel(piece: string): boolean {
  const raw = piece.trim();
  // No mid-sentence test: "Pet. Engr. aspirants question" is a label. The
  // length cap and the full stop at the end catch real sentences.
  if (!raw || raw.length > MAX_LABEL || raw.includes("\n")) return false;
  if (GENRE.test(raw)) return true;
  return !raw.includes(":") && !raw.endsWith(".");
}

/** "JAMB UTME 2021. Also asked in 2004." -> tag pieces, plus any real sentence left over. */
function readSource(body: string): { tags: string[]; rest: string | null } {
  // No lookbehind here: older iPhone Safari cannot parse it.
  const sentences = body.trim().split(/\.\s+/);
  if (!isHead(sentences[0] ?? "")) return { tags: [], rest: null };
  const tags = [trimStop(sentences[0])];
  let k = 1;
  for (; k < sentences.length; k++) {
    const s = trimStop(sentences[k]);
    // "Also asked in 2004." and "Passage genre: narrative." are labels.
    if (s.length <= MAX_LABEL && (/^also\s+(asked|set|appeared|came)\b/i.test(s) || GENRE.test(s))) {
      tags.push(lowerFirst(s));
    } else break;
  }
  const rest = sentences.slice(k).join(". ").trim();
  return { tags, rest: rest || null };
}

/** Puts a paragraph's own lead-in ("Time check:") in bold; null if it has none. */
function boldLead(paragraph: string): string | null {
  const m = paragraph.match(LEAD);
  if (!m) return null;
  const word = m[1].charAt(0).toUpperCase() + m[1].slice(1);
  return `**${word}:** ${paragraph.slice(m[0].length)}`;
}

/** The remark's first paragraph: its own lead-in, or "Note:" when it has none. */
function withLead(paragraph: string): string {
  const text = paragraph.trim();
  const led = boldLead(text);
  if (led) return led;
  // Inline only before ordinary prose; a list, table, heading or maths
  // block keeps its own first line.
  return /^[\p{L}\p{N}("'“‘*_]/u.test(text) ? `**Note:** ${text}` : `**Note:**\n\n${text}`;
}

const remarkOf = (paragraphs: string[]) =>
  paragraphs.map((p, i) => (i === 0 ? withLead(p) : (boldLead(p.trim()) ?? p.trim()))).join("\n\n");

export function splitNote(raw: string | null | undefined): NoteParts {
  const note = (raw ?? "").replace(/\r\n?/g, "\n").trim();
  if (!note) return { tag: null, remark: null };

  const [first, ...later] = note.split(/\n\s*\n/);
  // A note that opens with a Markdown table is all remark.
  if (first.trim().startsWith("|")) return { tag: null, remark: remarkOf(note.split(/\n\s*\n/)) };
  // "2021 || The image shows ..." has an empty piece; drop it.
  const pieces = first.trim().split(/\s*\|\s*/).filter(Boolean);
  const tags: string[] = [];
  const rest: string[] = [];

  let k = 0;
  for (; k < pieces.length; k++) {
    const piece = pieces[k].trim();
    const source = piece.match(/^source\s*:\s*([\s\S]+)$/i);
    if (source) {
      const read = readSource(source[1]);
      if (!read.tags.length) break;
      tags.push(...read.tags);
      if (read.rest) {
        rest.push(read.rest);
        k++;
        break;
      }
      continue;
    }
    // The first piece names the paper; later ones add a short label.
    if (tags.length === 0 ? isHead(piece) : isLabel(piece)) {
      tags.push(trimStop(piece));
      continue;
    }
    break;
  }

  // Nothing recognisable up front: the whole note is for reading.
  if (!tags.length) return { tag: null, remark: remarkOf(note.split(/\n\s*\n/)) };

  const leftover = pieces.slice(k).join(" | ").trim();
  if (leftover) rest.push(leftover);
  rest.push(...later.map((p) => p.trim()).filter(Boolean));

  return {
    tag: tags.join(" · "),
    remark: rest.length ? remarkOf(rest) : null,
  };
}
