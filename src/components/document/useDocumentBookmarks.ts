"use client";

import { useCallback, useSyncExternalStore } from "react";

const EMPTY_BOOKMARKS: string[] = [];
const snapshotCache = new Map<string, { raw: string | null; list: string[] }>();
const BOOKMARK_EVENT = "sonar-bookmarks-change";

function getStorageKey(documentId: string) {
  return `sonar-bookmarks:${documentId}`;
}

function readBookmarksSnapshot(documentId: string): string[] {
  if (typeof window === "undefined") return EMPTY_BOOKMARKS;
  const key = getStorageKey(documentId);
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return EMPTY_BOOKMARKS;
  }

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.list;
  }

  let parsed: string[] = EMPTY_BOOKMARKS;
  if (raw) {
    try {
      const value = JSON.parse(raw) as unknown;
      if (Array.isArray(value)) {
        parsed = value.filter((item): item is string => typeof item === "string");
      }
    } catch {
      parsed = EMPTY_BOOKMARKS;
    }
  }

  snapshotCache.set(key, { raw, list: parsed });
  return parsed;
}

export function useDocumentBookmarks(documentId: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => undefined;

      const handleStorage = (event: StorageEvent) => {
        if (!event.key || event.key === getStorageKey(documentId)) {
          onStoreChange();
        }
      };

      const handleCustom = (event: Event) => {
        const custom = event as CustomEvent<{ documentId?: string }>;
        if (!custom.detail?.documentId || custom.detail.documentId === documentId) {
          onStoreChange();
        }
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(BOOKMARK_EVENT, handleCustom);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(BOOKMARK_EVENT, handleCustom);
      };
    },
    [documentId]
  );

  const bookmarks = useSyncExternalStore(
    subscribe,
    () => readBookmarksSnapshot(documentId),
    () => EMPTY_BOOKMARKS
  );

  const toggleBookmark = useCallback(
    (blockId: string): boolean => {
      if (typeof window === "undefined") return false;
      const current = readBookmarksSnapshot(documentId);
      const exists = current.includes(blockId);
      const next = exists
        ? current.filter((id) => id !== blockId)
        : [...current, blockId];
      try {
        window.localStorage.setItem(getStorageKey(documentId), JSON.stringify(next));
      } catch {
        return false;
      }
      window.dispatchEvent(
        new CustomEvent(BOOKMARK_EVENT, { detail: { documentId } })
      );
      return !exists;
    },
    [documentId]
  );

  return { bookmarks, toggleBookmark };
}
