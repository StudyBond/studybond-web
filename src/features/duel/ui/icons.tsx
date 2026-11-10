/* Icons for the duel screens: lucide shapes drawn inline, as in the mockup. */

function Svg({ children, width = 2 }: { children: React.ReactNode; width?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const BackIcon = () => <Svg><path d="M15 6 9 12l6 6" /></Svg>;
export const CloseIcon = () => <Svg><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const WhatsAppIcon = () => <Svg width={1.9}><path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8Z" /></Svg>;
export const CopyIcon = () => (
  <Svg width={1.9}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </Svg>
);
export const ShareIcon = () => (
  <Svg width={1.9}>
    <path d="M12 3v12" />
    <path d="m7 8 5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </Svg>
);
export const ChevronRight = () => <Svg><path d="m9 6 6 6-6 6" /></Svg>;
export const EyeIcon = () => (
  <Svg width={1.9}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const EyeOffIcon = () => (
  <Svg width={1.9}>
    <path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.1M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Svg>
);
export const BookmarkIcon = () => <Svg width={1.9}><path d="M6 3h12v18l-6-4-6 4Z" /></Svg>;
export const FlagIcon = () => (
  <Svg width={1.9}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 4 2 4H5" />
  </Svg>
);
export const LockIcon = () => (
  <Svg>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);
export const GiftIcon = () => (
  <Svg>
    <path d="M20 12v9H4v-9" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 21V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
  </Svg>
);
export const PaperIcon = () => (
  <Svg>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h5" />
  </Svg>
);
export const CheckIcon = () => <Svg width={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const GhostIcon = () => (
  <Svg width={1.8}>
    <path d="M9 10h.01M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
  </Svg>
);
export const ClockIcon = () => (
  <Svg>
    <path d="M12 7v5l3 2" />
    <circle cx="12" cy="12" r="9" />
  </Svg>
);
