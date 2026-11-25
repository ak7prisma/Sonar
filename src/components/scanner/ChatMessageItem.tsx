"use client";

import React, { memo, useState } from "react";
import { type UIMessage } from "ai";
import { Bot, User, Volume2, Square, Copy, Check } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { FormattedMathText } from "@/components/document/FormattedMathText";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

interface ChatMessageItemProps {
  message: UIMessage;
  isSpeaking: boolean;
  onToggleSpeech: (id: string, text: string) => void;
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  isSpeaking,
  onToggleSpeech,
}: ChatMessageItemProps) {
  const { announce } = useLiveAnnouncer();
  const [isCopied, setIsCopied] = useState(false);

  const isUser = message.role === "user";
  const textContent = Array.isArray(message.parts)
    ? message.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n")
    : "";

  const handleCopy = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent);
    setIsCopied(true);
    announce("Teks disalin ke papan klip.", "polite");
    setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <div
      className={cn(
        "flex gap-3 text-sm",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
          <Bot className="size-4" aria-hidden="true" />
        </span>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs",
          isUser
            ? "bg-primary text-primary-foreground font-ui"
            : "bg-card border border-border text-foreground space-y-2.5"
        )}
      >
        <FormattedMathText
          text={textContent}
          as="div"
          className="leading-relaxed"
        />

        {!isUser && textContent && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs font-ui">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => onToggleSpeech(message.id, textContent)}
              className={cn(
                "h-7 px-3 text-xs rounded-full font-medium transition-colors",
                isSpeaking
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-surface-subtle hover:bg-brand-mint hover:text-brand-ink text-foreground"
              )}
            >
              {isSpeaking ? (
                <>
                  <Square className="size-3 mr-1 text-destructive-foreground" />
                  <span>Stop Suara</span>
                </>
              ) : (
                <>
                  <Volume2 className="size-3.5 mr-1.5 text-primary" />
                  <span>Dengarkan</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-7 px-2.5 text-xs rounded-full text-muted-foreground hover:text-foreground"
            >
              {isCopied ? (
                <>
                  <Check className="size-3 mr-1 text-primary" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="size-3 mr-1" />
                  <span>Salin</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground mt-0.5">
          <User className="size-4" aria-hidden="true" />
        </span>
      )}
    </div>
  );
});
