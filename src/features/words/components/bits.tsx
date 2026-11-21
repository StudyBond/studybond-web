import { sayParts, sentenceParts } from "../lib/words";

/* Small pieces shared by the public page, the dashboard card and the word book. */

/** "in-SOL-vent" with the stressed part in amber. */
export function SayAs({ text }: { text: string }) {
  return (
    <>
      {sayParts(text).map((part, index) => (part.stressed ? <b key={index}>{part.text}</b> : <span key={index}>{part.text}</span>))}
    </>
  );
}

/** The tested sentence, with only its <u>...</u> kept. */
export function Sentence({ text }: { text: string }) {
  return (
    <>
      {sentenceParts(text).map((part, index) => (part.underlined ? <u key={index}>{part.text}</u> : <span key={index}>{part.text}</span>))}
    </>
  );
}

export function ArrowIcon({ className, back = false }: { className?: string; back?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={back ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

export function TickIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Right answer">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Your pick, wrong">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
