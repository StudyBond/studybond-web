import { AVATAR_VIEWBOX, drawLook, normaliseLook, optionFor, type AvatarLook } from "@/features/avatar/avatar-look";

/* The shared Avatar's face (same parts file, same drawLook), written with
   inline styles only, so the card images (next/og) can draw it as well as
   the browser. Frames show as a ring, never a badge: a card is a print. */
export function AvatarArt({ look, size, ringOn }: { look: Partial<AvatarLook>; size: number; ringOn: string }) {
  const parts = normaliseLook(look);
  const { bg, shapes } = drawLook(parts);
  const frame = parts.frame === "none" ? null : optionFor("frame", parts.frame);
  const ring = frame?.ring ? Math.max(2, Math.round(size / 26)) : 0;
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: size,
        overflow: "hidden",
        background: bg,
        // next/og refuses a style set to undefined, so leave it out.
        ...(ring ? { boxShadow: `0 0 0 ${ring}px ${ringOn}, 0 0 0 ${ring * 2}px ${frame!.ring}` } : {}),
        flexShrink: 0,
      }}
    >
      <svg viewBox={AVATAR_VIEWBOX} width={size} height={size} aria-hidden="true">
        {shapes.map(({ key, el, fill, stroke, strokeWidth, strokeLinecap, opacity, ...g }) => {
          const common = { fill, stroke, strokeWidth, strokeLinecap, opacity } as Record<string, unknown>;
          if (el === "circle") return <circle key={key} cx={g.cx} cy={g.cy} r={g.r} {...common} />;
          if (el === "ellipse") return <ellipse key={key} cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} {...common} />;
          if (el === "rect") return <rect key={key} x={g.x} y={g.y} width={g.width} height={g.height} rx={g.rx} {...common} />;
          return <path key={key} d={String(g.d)} {...common} />;
        })}
      </svg>
    </div>
  );
}
