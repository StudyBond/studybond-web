import type { TextSize } from "@/lib/api/users";

/**
 * Text size: how much bigger the reading text gets (question, options,
 * passage, explanation, tables). Buttons, the clock and the ribbon keep
 * their size, so the screen layout holds at every step.
 */
export const TEXT_SIZES: readonly { value: TextSize; label: string; scale: number }[] = [
  { value: "normal", label: "Normal", scale: 1 },
  { value: "large", label: "Large", scale: 1.15 },
  { value: "larger", label: "Larger", scale: 1.3 },
];

export function textScale(size: TextSize | undefined): number {
  return TEXT_SIZES.find((t) => t.value === size)?.scale ?? 1;
}
