/* Line icons drawn from the design canvas (stroke, currentColor). */

type P = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const TickIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={3.2} className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const CrossIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={3} className={className}><path d="M7 7l10 10M17 7 7 17" /></svg>
);
export const ChevronDown = ({ className }: P) => (
  <svg {...base} strokeWidth={2.2} className={className}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronRight = ({ className }: P) => (
  <svg {...base} strokeWidth={2.2} className={className}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronLeft = ({ className }: P) => (
  <svg {...base} strokeWidth={2.2} className={className}><path d="m15 6-6 6 6 6" /></svg>
);
export const FreezeIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /></svg>
);
export const BrokenLinkIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="m5.17 11.75-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    <path d="M8 2v3M2 8h3M16 19v3M19 16h3" />
  </svg>
);
export const ChallengeIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={1.9} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);
export const CardIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={1.9} className={className}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19M6.5 15h4" /></svg>
);
export const BookmarkIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={1.9} className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></svg>
);
export const SwordsIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6M16 16l4 4M19 21l2-2" />
    <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
    <path d="m5 14 4 4M7 17l-3 3M3 19l2 2" />
  </svg>
);
export const OfflineIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M12 20h.01" /><path d="M8.5 16.4a5 5 0 0 1 7 0" /><path d="M5 12.9a10 10 0 0 1 5.2-2.8" />
    <path d="M19 12.9a10 10 0 0 0-2.1-1.6" /><path d="M2 8.8a15 15 0 0 1 4.2-2.7" /><path d="M22 8.8A15 15 0 0 0 11 5" />
    <path d="m2 2 20 20" />
  </svg>
);
export const SpeakerIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={1.9} className={className}>
    <path d="M11 5 6 9H3v6h3l5 4Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);
