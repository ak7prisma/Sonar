"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReaderLanguage } from "@/stores/accessibility-store";

export interface AudioReadableBlock {
  id: string;
  spokenText: string;
  label?: string;
}

const subscribeNoop = () => () => undefined;

export function useAudioReader(options: {
  blocks: AudioReadableBlock[];
  rate: number;
  language: ReaderLanguage;
  onBlockChange?: (blockId: string, index: number) => void;
  onAnnounce?: (message: string) => void;
}) {
  const { blocks, rate, language, onBlockChange, onAnnounce } = options;
  const isSupported = useSyncExternalStore(
    subscribeNoop,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldContinueRef = useRef(false);
  const speakBlockRef = useRef<(index: number) => void>(() => undefined);

  useEffect(() => {
    return () => {
      shouldContinueRef.current = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakBlockAt = useCallback(
    (index: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      if (index < 0 || index >= blocks.length) {
        shouldContinueRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        onAnnounce?.("Finished audio narration of document.");
        return;
      }

      const target = blocks[index];
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(target.spokenText);
      utterance.lang = language === "id" ? "id-ID" : "en-US";
      utterance.rate = rate;

      utterance.onstart = () => {
        setActiveIndex(index);
        setIsPlaying(true);
        setIsPaused(false);
        onBlockChange?.(target.id, index);
      };

      utterance.onend = () => {
        if (shouldContinueRef.current) {
          speakBlockRef.current(index + 1);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      };

      utterance.onerror = () => {
        shouldContinueRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [blocks, language, onAnnounce, onBlockChange, rate]
  );

  useEffect(() => {
    speakBlockRef.current = speakBlockAt;
  }, [speakBlockAt]);

  const playFrom = useCallback(
    (index = activeIndex) => {
      if (!isSupported || blocks.length === 0) return;
      shouldContinueRef.current = true;
      speakBlockAt(Math.min(Math.max(0, index), blocks.length - 1));
    },
    [activeIndex, blocks.length, isSupported, speakBlockAt]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      onAnnounce?.("Audio narration paused.");
    }
  }, [isSupported, onAnnounce]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      onAnnounce?.("Audio narration resumed.");
    } else {
      playFrom(activeIndex);
    }
  }, [activeIndex, isSupported, onAnnounce, playFrom]);

  const stop = useCallback(() => {
    shouldContinueRef.current = false;
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const next = useCallback(() => {
    if (blocks.length === 0) return;
    const nextIdx = Math.min(activeIndex + 1, blocks.length - 1);
    setActiveIndex(nextIdx);
    onBlockChange?.(blocks[nextIdx].id, nextIdx);
    if (isPlaying || isPaused) {
      shouldContinueRef.current = true;
      speakBlockAt(nextIdx);
    }
  }, [activeIndex, blocks, isPaused, isPlaying, onBlockChange, speakBlockAt]);

  const previous = useCallback(() => {
    if (blocks.length === 0) return;
    const prevIdx = Math.max(activeIndex - 1, 0);
    setActiveIndex(prevIdx);
    onBlockChange?.(blocks[prevIdx].id, prevIdx);
    if (isPlaying || isPaused) {
      shouldContinueRef.current = true;
      speakBlockAt(prevIdx);
    }
  }, [activeIndex, blocks, isPaused, isPlaying, onBlockChange, speakBlockAt]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    activeIndex,
    currentBlock: blocks[activeIndex] ?? null,
    totalBlocks: blocks.length,
    playFrom,
    pause,
    resume,
    stop,
    next,
    previous,
  };
}
