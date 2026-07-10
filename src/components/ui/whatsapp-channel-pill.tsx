"use client";

import { cn } from "@/lib/utils/cn";

/* ─── WhatsApp Icon (inline SVG) ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Sidebar Pill (Desktop) ─── */

type WhatsAppChannelPillProps = {
  onClick: () => void;
  isCollapsed: boolean;
};

export function WhatsAppChannelSidebarPill({
  onClick,
  isCollapsed,
}: WhatsAppChannelPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl transition-all duration-300 sb-wa-pill-pulse cursor-pointer",
        isCollapsed
          ? "mx-auto h-9 w-9 justify-center bg-[var(--sb-whatsapp)]/8 hover:bg-[var(--sb-whatsapp)]/15"
          : "mx-3 mb-3 px-3 py-2.5 bg-[var(--sb-whatsapp)]/[0.05] border border-[var(--sb-whatsapp)]/10 hover:bg-[var(--sb-whatsapp)]/[0.08] hover:border-[var(--sb-whatsapp)]/20"
      )}
      title="Join our WhatsApp Updates Channel"
    >
      <WhatsAppIcon
        className={cn(
          "shrink-0 text-[var(--sb-whatsapp)] transition-transform group-hover:scale-110",
          isCollapsed ? "h-4 w-4" : "h-3.5 w-3.5"
        )}
      />
      {!isCollapsed && (
        <>
          <span className="text-[11px] font-semibold text-[var(--sb-whatsapp)]/70 group-hover:text-[var(--sb-whatsapp)]">
            Join Updates
          </span>
          <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-[var(--sb-whatsapp)] shadow-[0_0_6px_var(--sb-whatsapp-glow)]" />
        </>
      )}

      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          Join Updates Channel
        </div>
      )}
    </button>
  );
}

/* ─── Floating Pill (Mobile) ─── */

type WhatsAppChannelMobilePillProps = {
  onClick: () => void;
};

export function WhatsAppChannelMobilePill({
  onClick,
}: WhatsAppChannelMobilePillProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sb-whatsapp)] text-white shadow-[0_4px_20px_var(--sb-whatsapp-glow)] sb-wa-pill-pulse transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_28px_var(--sb-whatsapp-glow)] active:scale-95 cursor-pointer md:hidden"
      title="Join our WhatsApp Updates Channel"
      aria-label="Join WhatsApp Updates Channel"
    >
      <WhatsAppIcon className="h-5 w-5" />
      {/* Notification dot */}
      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--sb-whatsapp)]" />
      </span>
    </button>
  );
}
