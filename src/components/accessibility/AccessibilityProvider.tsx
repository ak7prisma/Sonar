"use client";

import { useEffect } from "react";
import {
  useAccessibilityStore,
  type ReadingFont,
  type ReadingWidth,
} from "@/stores/accessibility-store";

const FONT_CSS_MAP: Record<ReadingFont, string> = {
  default: "var(--font-poppins), ui-sans-serif, sans-serif",
  atkinson:
    "var(--font-atkinson-hyperlegible), var(--font-poppins), ui-sans-serif, sans-serif",
  inter: "var(--font-poppins), ui-sans-serif, sans-serif",
  lexend: "var(--font-poppins), ui-sans-serif, sans-serif",
};

const WIDTH_CSS_MAP: Record<ReadingWidth, string> = {
  narrow: "56ch",
  comfortable: "68ch",
  wide: "82ch",
};

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const readingFont = useAccessibilityStore((s) => s.readingFont);
  const fontSizePx = useAccessibilityStore((s) => s.fontSizePx);
  const lineHeight = useAccessibilityStore((s) => s.lineHeight);
  const letterSpacingEm = useAccessibilityStore((s) => s.letterSpacingEm);
  const readingWidth = useAccessibilityStore((s) => s.readingWidth);
  const contrastMode = useAccessibilityStore((s) => s.contrastMode);
  const readingSurface = useAccessibilityStore((s) => s.readingSurface);
  const motionPreference = useAccessibilityStore((s) => s.motionPreference);
  const language = useAccessibilityStore((s) => s.language);

  useEffect(() => {
    const root = document.documentElement;
    const fontCss = FONT_CSS_MAP[readingFont] || FONT_CSS_MAP.default;
    root.style.setProperty("--reader-font-family", fontCss);
    root.style.setProperty("--reader-font-size", `${fontSizePx}px`);
    root.style.setProperty("--reader-line-height", String(lineHeight));
    root.style.setProperty("--reader-letter-spacing", `${letterSpacingEm}em`);
    root.style.setProperty("--reader-max-width", WIDTH_CSS_MAP[readingWidth]);

    root.setAttribute("data-contrast", contrastMode);
    root.setAttribute("data-surface", readingSurface);
    root.setAttribute("data-reading-font", readingFont === "atkinson" ? "atkinson" : "default");
    root.setAttribute(
      "data-reduced-motion",
      motionPreference === "reduce" ? "true" : "false"
    );
    root.setAttribute("lang", language);
  }, [
    contrastMode,
    fontSizePx,
    language,
    letterSpacingEm,
    lineHeight,
    motionPreference,
    readingFont,
    readingSurface,
    readingWidth,
  ]);

  return <>{children}</>;
}
