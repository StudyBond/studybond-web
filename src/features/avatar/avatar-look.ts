import parts from "./avatar-parts.json";

/* Typed access to the shared avatar definition. avatar-parts.json is copied
   from the backend (npm run avatar:sync) and must never be edited here. */

export const AVATAR_PARTS = ["skin", "hair", "head", "glasses", "top", "bg", "frame"] as const;
export type AvatarPart = (typeof AVATAR_PARTS)[number];

/** What a student picks: one option id per part. */
export type AvatarLook = Record<AvatarPart, string>;

/** What the server sends: the look, its version, and whether it's the default. */
export type AvatarView = AvatarLook & { v: number; isDefault: boolean };

export type AvatarOption = {
  id: string;
  label: string;
  hex?: string;
  glass?: string;
  ring?: string;
  badge?: string;
};

type Shape = {
  el: "circle" | "ellipse" | "rect" | "path";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "round" | "butt" | "square";
  opacity?: number;
  [geometry: string]: string | number | undefined;
};

type Layer = {
  id: string;
  when?: Partial<Record<AvatarPart, string[]>>;
  shapes: Shape[];
};

export const AVATAR_VIEWBOX = parts.viewBox;
export const AVATAR_OPTIONS = parts.options as Record<AvatarPart, AvatarOption[]>;
export const AVATAR_INKS = parts.inks;
export const AVATAR_FRAME_STYLE = parts.frameStyle;
const LAYERS = parts.layers as Layer[];

export function optionFor(part: AvatarPart, id: string | undefined): AvatarOption {
  const list = AVATAR_OPTIONS[part];
  return list.find((option) => option.id === id) ?? list[0];
}

/** Every part filled in with a known id (unknown ids become the first option). */
export function normaliseLook(look: Partial<AvatarLook> | null | undefined): AvatarLook {
  return {
    skin: optionFor("skin", look?.skin).id,
    hair: optionFor("hair", look?.hair).id,
    head: optionFor("head", look?.head).id,
    glasses: optionFor("glasses", look?.glasses).id,
    top: optionFor("top", look?.top).id,
    bg: optionFor("bg", look?.bg).id,
    frame: optionFor("frame", look?.frame).id,
  };
}

export type DrawnShape = Shape & { key: string };

/** The shapes to paint for a look, in order, with colour tokens resolved. */
export function drawLook(look: AvatarLook): { bg: string; shapes: DrawnShape[] } {
  const skin = optionFor("skin", look.skin);
  const colours: Record<string, string> = {
    "@skin": skin.hex ?? "#5a3825",
    "@glass": skin.glass ?? AVATAR_INKS.hair,
    "@top": optionFor("top", look.top).hex ?? "#3a5a9a",
    "@hair": AVATAR_INKS.hair,
    "@line": AVATAR_INKS.line,
  };
  const paint = (value: string | undefined) => (value && value.startsWith("@") ? colours[value] : value);

  const shapes: DrawnShape[] = [];
  for (const layer of LAYERS) {
    const shows = Object.entries(layer.when ?? {}).every(([part, values]) =>
      (values as string[]).includes(look[part as AvatarPart]),
    );
    if (!shows) continue;
    layer.shapes.forEach((shape, index) => {
      shapes.push({
        ...shape,
        fill: paint(shape.fill),
        stroke: paint(shape.stroke),
        key: `${layer.id}-${index}`,
      });
    });
  }
  return { bg: optionFor("bg", look.bg).hex ?? "#2a3550", shapes };
}

/** A few random looks for "Surprise me". Headwear and glasses are rarer. */
export function randomLook(keepFrame: string): AvatarLook {
  const pick = (part: AvatarPart, from = 0) => {
    const list = AVATAR_OPTIONS[part].slice(from);
    return list[Math.floor(Math.random() * list.length)].id;
  };
  return {
    skin: pick("skin"),
    hair: pick("hair"),
    head: Math.random() < 0.55 ? "none" : pick("head", 1),
    glasses: Math.random() < 0.6 ? "none" : pick("glasses", 1),
    top: pick("top"),
    bg: pick("bg"),
    frame: keepFrame,
  };
}
