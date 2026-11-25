"use client";

import { useCallback, useEffect, useState } from "react";
import { narrateMixedText } from "@/features/math-ocr/math-narration";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

interface UseSpeechSynthesisOptions {
  language?: "id" | "en";
}

export function useSpeechSynthesis({ language = "id" }: UseSpeechSynthesisOptions = {}) {
  const { announce } = useLiveAnnouncer();
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        announce("Peramban tidak mendukung sintesis suara.", "assertive");
        return;
      }

      if (currentlySpeakingId === id) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();
      const spoken = narrateMixedText(text, language);
      const utter = new SpeechSynthesisUtterance(spoken);
      utter.lang = language === "id" ? "id-ID" : "en-US";
      utter.rate = 1.0;

      try {
        const voices = window.speechSynthesis.getVoices?.() || [];
        const targetPrefix = language === "id" ? "id" : "en";
        const matched = voices.find((v) =>
          v.lang.toLowerCase().startsWith(targetPrefix)
        );
        if (matched) utter.voice = matched;
      } catch {
        // fallback to system default
      }

      utter.onstart = () => setCurrentlySpeakingId(id);
      utter.onend = () => setCurrentlySpeakingId(null);
      utter.onerror = () => setCurrentlySpeakingId(null);

      // Browser delay to prevent Chrome cancel race condition
      setTimeout(() => {
        window.speechSynthesis.speak(utter);
      }, 60);
    },
    [currentlySpeakingId, language, announce, stop]
  );

  return {
    currentlySpeakingId,
    speak,
    stop,
    isSpeaking: currentlySpeakingId !== null,
  };
}
