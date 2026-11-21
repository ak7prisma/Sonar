"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReadingFont = "atkinson" | "inter" | "lexend";
export type ReadingWidth = "narrow" | "comfortable" | "wide";
export type ContrastMode = "standard" | "high";
export type ReadingSurface = "default" | "warm";
export type MotionPreference = "system" | "reduce";
export type ReaderLanguage = "en" | "id";

export interface AccessibilityPreferencesState {
  readingFont: ReadingFont;
  fontSizePx: number;
  lineHeight: number;
  letterSpacingEm: number;
  readingWidth: ReadingWidth;
  contrastMode: ContrastMode;
  readingSurface: ReadingSurface;
  narrationSpeed: number;
  motionPreference: MotionPreference;
  language: ReaderLanguage;
  setReadingFont: (font: ReadingFont) => void;
  setFontSizePx: (size: number) => void;
  setLineHeight: (lineHeight: number) => void;
  setLetterSpacingEm: (spacing: number) => void;
  setReadingWidth: (width: ReadingWidth) => void;
  setContrastMode: (mode: ContrastMode) => void;
  setReadingSurface: (surface: ReadingSurface) => void;
  setNarrationSpeed: (speed: number) => void;
  setMotionPreference: (pref: MotionPreference) => void;
  setLanguage: (lang: ReaderLanguage) => void;
  hydrateFromServer: (prefs: Partial<AccessibilityPreferencesValues>) => void;
  resetDefaults: () => void;
}

export interface AccessibilityPreferencesValues {
  readingFont: ReadingFont;
  fontSizePx: number;
  lineHeight: number;
  letterSpacingEm: number;
  readingWidth: ReadingWidth;
  contrastMode: ContrastMode;
  readingSurface: ReadingSurface;
  narrationSpeed: number;
  motionPreference: MotionPreference;
  language: ReaderLanguage;
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferencesValues = {
  readingFont: "atkinson",
  fontSizePx: 18,
  lineHeight: 1.72,
  letterSpacingEm: 0,
  readingWidth: "comfortable",
  contrastMode: "standard",
  readingSurface: "default",
  narrationSpeed: 1,
  motionPreference: "system",
  language: "en",
};

export const useAccessibilityStore = create<AccessibilityPreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      setReadingFont: (readingFont) => set({ readingFont }),
      setFontSizePx: (fontSizePx) =>
        set({ fontSizePx: Math.min(28, Math.max(14, fontSizePx)) }),
      setLineHeight: (lineHeight) =>
        set({ lineHeight: Math.min(2.4, Math.max(1.3, Number(lineHeight.toFixed(2)))) }),
      setLetterSpacingEm: (letterSpacingEm) =>
        set({
          letterSpacingEm: Math.min(
            0.12,
            Math.max(0, Number(letterSpacingEm.toFixed(3)))
          ),
        }),
      setReadingWidth: (readingWidth) => set({ readingWidth }),
      setContrastMode: (contrastMode) => set({ contrastMode }),
      setReadingSurface: (readingSurface) => set({ readingSurface }),
      setNarrationSpeed: (narrationSpeed) =>
        set({
          narrationSpeed: Math.min(2.5, Math.max(0.5, Number(narrationSpeed.toFixed(2)))),
        }),
      setMotionPreference: (motionPreference) => set({ motionPreference }),
      setLanguage: (language) => set({ language }),
      hydrateFromServer: (prefs) => set((state) => ({ ...state, ...prefs })),
      resetDefaults: () => set({ ...DEFAULT_ACCESSIBILITY_PREFERENCES }),
    }),
    {
      name: "sonar-accessibility-preferences-v1",
    }
  )
);
