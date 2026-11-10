import { memo, type CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import {
  AVATAR_FRAME_STYLE,
  AVATAR_INKS,
  AVATAR_VIEWBOX,
  drawLook,
  normaliseLook,
  optionFor,
  type AvatarLook,
} from "@/features/avatar/avatar-look";

type AvatarProps = {
  look: Partial<AvatarLook> | null | undefined;
  /** Width and height in px. */
  size?: number;
  /** Spoken name, e.g. "Tobi's avatar". Without it the picture is decorative. */
  label?: string;
  className?: string;
  /** Hide the frame ring and badge (used for the part pickers). */
  noFrame?: boolean;
};

/* The one place an avatar is drawn on the website. Everything comes from
   avatar-parts.json, so the phone app draws the same face from the same file.
   No pictures are fetched: it's inline SVG. */
function AvatarInner({ look, size = 36, label, className, noFrame }: AvatarProps) {
  if (!look) {
    /* Still loading: an empty circle, never a made-up face. */
    return (
      <span
        className={cn("inline-block shrink-0 rounded-full bg-white/[0.06] align-middle", className)}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }
  const parts = normaliseLook(look);
  const { bg, shapes } = drawLook(parts);
  const frame = noFrame ? null : parts.frame === "none" ? null : optionFor("frame", parts.frame);

  const ringWidth = size >= AVATAR_FRAME_STYLE.largeFrom ? AVATAR_FRAME_STYLE.ringWidthLarge : AVATAR_FRAME_STYLE.ringWidthSmall;
  const showBadge = Boolean(frame?.badge) && size >= AVATAR_FRAME_STYLE.badgeFrom;
  const badgePx = Math.max(AVATAR_FRAME_STYLE.badgeMin, Math.round(size * AVATAR_FRAME_STYLE.badgeScale));

  const outer: CSSProperties = {
    width: size,
    height: size,
    boxShadow: frame?.ring
      ? `0 0 0 ${ringWidth}px var(--sb-bg, #09090b), 0 0 0 ${ringWidth * 2}px ${frame.ring}`
      : undefined,
  };

  return (
    <span
      className={cn("relative inline-block shrink-0 rounded-full align-middle", className)}
      style={outer}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span className="block h-full w-full overflow-hidden rounded-full" style={{ background: bg }}>
        <svg
          viewBox={AVATAR_VIEWBOX}
          width={size}
          height={size}
          className="block"
          aria-hidden="true"
          focusable="false"
        >
          {shapes.map(({ key, el, fill, stroke, strokeWidth, strokeLinecap, opacity, ...geometry }) => {
            const common = { fill, stroke, strokeWidth, strokeLinecap, opacity };
            if (el === "circle") return <circle key={key} cx={geometry.cx} cy={geometry.cy} r={geometry.r} {...common} />;
            if (el === "ellipse") return <ellipse key={key} cx={geometry.cx} cy={geometry.cy} rx={geometry.rx} ry={geometry.ry} {...common} />;
            if (el === "rect") return <rect key={key} x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={geometry.rx} {...common} />;
            return <path key={key} d={String(geometry.d)} {...common} />;
          })}
        </svg>
      </span>
      {showBadge && frame ? (
        <span
          className="absolute box-border rounded-full text-center font-bold"
          style={{
            right: AVATAR_FRAME_STYLE.badgeOffset,
            bottom: AVATAR_FRAME_STYLE.badgeOffset,
            minWidth: badgePx,
            height: badgePx,
            padding: "0 3px",
            background: frame.ring,
            color: AVATAR_INKS.badgeText,
            fontSize: Math.round(badgePx * 0.5),
            lineHeight: `${badgePx}px`,
            boxShadow: "0 0 0 2px var(--sb-bg, #09090b)",
          }}
          aria-hidden="true"
        >
          {frame.badge}
        </span>
      ) : null}
    </span>
  );
}

export const Avatar = memo(AvatarInner);
