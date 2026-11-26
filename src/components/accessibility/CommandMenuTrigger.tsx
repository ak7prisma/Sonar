"use client";

import React, { memo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

interface CommandMenuTriggerProps {
  onOpen: () => void;
  bar?: boolean;
  compact?: boolean;
}

export const CommandMenuTrigger = memo(function CommandMenuTrigger({
  onOpen,
  bar = false,
  compact = false,
}: CommandMenuTriggerProps) {
  const { isEn } = useTranslation();

  if (bar) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="flex size-10 items-center justify-center gap-2.5 rounded-full border border-border bg-card text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:h-11 sm:w-full sm:justify-start sm:px-4"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="hidden flex-1 truncate text-left sm:inline">
          {isEn ? "Search pages, materials, courses…" : "Cari halaman, materi, mata kuliah…"}
        </span>
        <span className="sr-only sm:hidden">
          {isEn ? "Search pages" : "Cari halaman"}
        </span>
        <kbd
          aria-hidden="true"
          className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground lg:inline"
        >
          Ctrl K
        </kbd>
      </button>
    );
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpen}
        aria-label="Cari halaman & materi (Ctrl+K)"
        aria-haspopup="dialog"
        className="text-muted-foreground hover:text-foreground"
      >
        <Search className="size-4" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpen}
      className="gap-2 text-muted-foreground"
    >
      <Search className="size-4" aria-hidden="true" />
      <span className="hidden md:inline">Cari halaman &amp; materi</span>
      <span className="sr-only md:hidden">Pencarian cepat</span>
      <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground lg:inline">
        Ctrl+K
      </kbd>
    </Button>
  );
});
