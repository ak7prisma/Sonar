"use client";

import React, { forwardRef } from "react";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

interface ChatInputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
  placeholder: string;
  variant?: "card" | "floating";
  className?: string;
}

export const ChatInputBar = forwardRef<HTMLFormElement, ChatInputBarProps>(
  function ChatInputBar(
    {
      value,
      onChange,
      onSubmit,
      isStreaming,
      placeholder,
      variant = "card",
      className,
    },
    ref
  ) {
    const isFloating = variant === "floating";

    return (
      <form
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className={cn(
          "flex items-center gap-2 font-ui",
          !isFloating && "pt-2 border-t border-border/40",
          className
        )}
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            disabled={isStreaming}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full rounded-full border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50",
              isFloating
                ? "h-10 bg-background/95 px-4 text-xs sm:text-sm"
                : "h-11 bg-background px-4 pr-10 text-sm"
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={!value.trim() || isStreaming}
          className={cn(
            "rounded-full font-semibold shadow-xs transition-transform active:scale-95",
            isFloating
              ? "h-10 px-5 text-xs min-w-22"
              : "h-11 px-5 text-xs min-w-24"
          )}
        >
          {isStreaming ? (
            <Loader2
              className={cn(
                "animate-spin",
                isFloating ? "size-3.5" : "size-4"
              )}
            />
          ) : (
            <>
              <span>Kirim</span>
              <CornerDownLeft
                className={cn("ml-1.5", isFloating ? "size-3" : "size-3.5")}
              />
            </>
          )}
        </Button>
      </form>
    );
  }
);
