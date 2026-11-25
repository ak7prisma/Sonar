/**
 * Palette-driven course tones for the signed-in workspace.
 *
 * Every `surface` is a fixed (theme-independent) brand tint and MUST be paired
 * with `text-brand-ink`. `icon` colors are verified >= 3:1 against their
 * surface (non-text contrast); never use them for body text.
 */
export type CourseTone = "teal" | "blue" | "peach" | "gold";

interface CourseLike {
  id?: string | null;
  code?: string | null;
  discipline?: string | null;
}

export const TONE_STYLES: Record<
  CourseTone,
  { surface: string; icon: string; bar: string; ring: string }
> = {
  teal: {
    surface: "bg-brand-mint",
    icon: "text-brand-teal",
    bar: "bg-brand-teal",
    ring: "ring-brand-teal/30",
  },
  blue: {
    surface: "bg-tint-blue",
    icon: "text-brand-blue-strong",
    bar: "bg-brand-blue",
    ring: "ring-brand-blue/40",
  },
  peach: {
    surface: "bg-tint-peach",
    icon: "text-[#9a3f17]",
    bar: "bg-brand-peach",
    ring: "ring-brand-peach/50",
  },
  gold: {
    surface: "bg-tint-gold",
    icon: "text-[#7a5a00]",
    bar: "bg-brand-gold",
    ring: "ring-brand-gold/60",
  },
};

const ROTATION: CourseTone[] = ["teal", "blue", "peach", "gold"];

export function getCourseTone(course: CourseLike | null | undefined): CourseTone {
  const code = (course?.code ?? course?.id ?? "").toLowerCase().trim();
  if (code.startsWith("cs")) return "teal";
  if (code.startsWith("math")) return "blue";
  if (code.startsWith("stat")) return "peach";

  let hash = 0;
  for (const char of code) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ROTATION[hash % ROTATION.length];
}

export function getCourseToneStyles(course: CourseLike | null | undefined) {
  return TONE_STYLES[getCourseTone(course)];
}
