import type { ReactNode } from "react";

/* Line icons from the notifications canvas (lucide shapes, 1.9 stroke). */

function Svg({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

type P = { className?: string };

export const BellIcon = ({ className }: P) => (
  <Svg className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></Svg>
);
export const BellOffIcon = ({ className }: P) => (
  <Svg className={className}><path d="M8.7 3A6 6 0 0 1 18 8a21 21 0 0 0 .6 5" /><path d="M17 17H3s3-2 3-9a4.7 4.7 0 0 1 .3-1.7" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="m2 2 20 20" /></Svg>
);
export const SwordsIcon = ({ className }: P) => (
  <Svg className={className}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" /><line x1="5" x2="9" y1="14" y2="18" /><line x1="7" x2="4" y1="17" y2="20" /><line x1="3" x2="5" y1="19" y2="21" />
  </Svg>
);
export const CardIcon = ({ className }: P) => (
  <Svg className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></Svg>
);
export const TickIcon = ({ className }: P) => <Svg className={className}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const PinIcon = ({ className }: P) => <Svg className={className}><circle cx="12" cy="9" r="4" /><path d="M12 13v8" /></Svg>;
export const CloseIcon = ({ className }: P) => <Svg className={className}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const ChevronRight = ({ className }: P) => <Svg className={className}><path d="m9 6 6 6-6 6" /></Svg>;
export const ChevronLeft = ({ className }: P) => <Svg className={className}><path d="M15 5l-7 7 7 7" /></Svg>;
export const ChevronDown = ({ className }: P) => <Svg className={className}><path d="m6 9 6 6 6-6" /></Svg>;
export const ChevronUp = ({ className }: P) => <Svg className={className}><path d="m6 15 6-6 6 6" /></Svg>;
export const PhoneIcon = ({ className }: P) => <Svg className={className}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></Svg>;
export const LaptopIcon = ({ className }: P) => <Svg className={className}><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></Svg>;
export const InfoIcon = ({ className }: P) => <Svg className={className}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Svg>;
export const ShareIcon = ({ className }: P) => (
  <Svg className={className}><path d="M12 3v12" /><path d="m8 7 4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></Svg>
);
export const AddSquareIcon = ({ className }: P) => <Svg className={className}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></Svg>;

export function DeviceIcon({ word, className }: { word: string; className?: string }) {
  return word === "laptop" ? <LaptopIcon className={className} /> : <PhoneIcon className={className} />;
}
