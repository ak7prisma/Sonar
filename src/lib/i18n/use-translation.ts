"use client";

import { useAccessibilityStore } from "@/stores/accessibility-store";
import { TRANSLATIONS, type TranslationKey } from "./translations";

export function useTranslation() {
  const language = useAccessibilityStore((s) => s.language);
  const setLanguage = useAccessibilityStore((s) => s.setLanguage);

  const t = (key: TranslationKey, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] ?? TRANSLATIONS.id;
    return langDict[key] ?? fallback ?? TRANSLATIONS.id[key] ?? key;
  };

  return {
    language,
    setLanguage,
    t,
    isId: language === "id",
    isEn: language === "en",
  };
}
