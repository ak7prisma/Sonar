"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Bot,
  Copy,
  Check,
  CornerDownLeft,
  Loader2,
  Sparkles,
  User,
  Volume2,
  Square,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { FormattedMathText } from "@/components/document/FormattedMathText";
import { narrateMixedText } from "@/features/math-ocr/math-narration";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import type { ExtractedBlockOutput } from "@/features/ocr/ocr-provider";

interface ScannedMaterialAiChatProps {
  documentId: string;
  documentTitle: string;
  blocks: ExtractedBlockOutput[];
  language: "id" | "en";
}

export function ScannedMaterialAiChat({
  documentId,
  documentTitle,
  blocks,
  language,
}: ScannedMaterialAiChatProps) {
  const { announce } = useLiveAnnouncer();
  const [inputVal, setInputVal] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [isCardFormVisible, setIsCardFormVisible] = useState(false);

  const chatSectionRef = useRef<HTMLElement>(null);
  const cardFormRef = useRef<HTMLFormElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardFormRef.current;
    if (!el || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      setIsCardFormVisible(inView);
    };
    checkVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCardFormVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
        body: () => ({
          documentId,
          documentTitle,
          language,
          blocks: blocks.map((b, idx) => ({
            id: `blk-${idx + 1}`,
            pageNumber: 1,
            readingOrder: idx + 1,
            blockType: b.blockType,
            sectionHeading: b.blockType === "heading" ? b.contentText : null,
            contentText: b.contentText,
            spokenText: b.spokenText,
          })),
        }),
      }),
    [documentId, documentTitle, language, blocks]
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    id: `scan-chat-${documentId}`,
    transport: chatTransport,
    onFinish: () => {
      announce("Asisten selesai memberikan jawaban.", "polite");
      setTimeout(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSendQuery = (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q || isStreaming) return;
    clearError();
    setInputVal("");
    announce(`Mengirim pertanyaan: ${q}`, "polite");
    sendMessage({ text: q });
    setTimeout(() => {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    announce("Teks disalin ke papan klip.", "polite");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSpeakText = (id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      announce("Peramban tidak mendukung sintesis suara.", "assertive");
      return;
    }

    if (currentlySpeakingId === id) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
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
  };

  const samplePrompts = useMemo(() => {
    if (language === "en") {
      return [
        "Explain the key concepts of this material in simple terms.",
        "Walk me through the mathematical equations step by step.",
        "Create 3 practice quiz questions based on this text.",
      ];
    }
    return [
      "Jelaskan konsep utama materi ini dengan bahasa yang mudah dipahami.",
      "Jelaskan rumus matematika dan langkah-langkahnya dari teks ini.",
      "Buatkan 3 pertanyaan latihan beserta jawabannya dari materi ini.",
    ];
  }, [language]);

  return (
    <>
      <section
        ref={chatSectionRef}
        aria-label="Diskusi dan Tanya Jawab AI Materi Ini"
        className="rounded-3xl border border-primary/25 bg-card p-5 shadow-card sm:p-7 space-y-5"
      >
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="size-4" aria-hidden="true" />
          </span>
          <h3 className="font-heading text-base font-bold text-foreground">
            {language === "id"
              ? "Diskusi & Tanya AI Berdasarkan Materi Ini"
              : "Ask AI & Discuss This Material"}
          </h3>
        </div>
      </div>

      {/* Suggested Prompts if no conversation yet */}
      {messages.length === 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-muted-foreground">
            {language === "id"
              ? "Contoh pertanyaan cepat:"
              : "Quick discussion prompts:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((promptText, pIdx) => (
              <button
                key={pIdx}
                type="button"
                disabled={isStreaming}
                onClick={() => handleSendQuery(promptText)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle/80 px-3.5 py-1.5 text-xs text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 text-left disabled:opacity-50 font-ui"
              >
                <Sparkles className="size-3 shrink-0 text-primary" aria-hidden="true" />
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Stream */}
      {messages.length > 0 && (
        <div
          role="log"
          aria-live="polite"
          className="space-y-3.5 max-h-[460px] overflow-y-auto pr-2 rounded-2xl bg-surface-subtle/40 p-4 border border-border/50"
        >
          {messages.map((msg: UIMessage) => {
            const isUser = msg.role === "user";
            const textContent =
              Array.isArray(msg.parts)
                ? msg.parts
                    .filter((p): p is { type: "text"; text: string } => p.type === "text")
                    .map((p) => p.text)
                    .join("\n")
                : "";

            return (
              <div
                key={msg.id}
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
                        onClick={() => handleSpeakText(msg.id, textContent)}
                        className={cn(
                          "h-7 px-3 text-xs rounded-full font-medium transition-colors",
                          currentlySpeakingId === msg.id
                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            : "bg-surface-subtle hover:bg-brand-mint hover:text-brand-ink text-foreground"
                        )}
                      >
                        {currentlySpeakingId === msg.id ? (
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
                        onClick={() => handleCopyText(msg.id, textContent)}
                        className="h-7 px-2.5 text-xs rounded-full text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === msg.id ? (
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
          })}

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>
                {language === "id"
                  ? "Asisten sedang menganalisis materi dan merumuskan jawaban..."
                  : "Assistant is retrieving material context and formulating response..."}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error.message || "Gagal memuat respon AI. Silakan coba lagi."}
            </div>
          )}

          <div ref={scrollEndRef} />
        </div>
      )}

        {/* Input Box inside Card - Sejajar 100% dengan card */}
        <form
          ref={cardFormRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2 pt-2 border-t border-border/40 font-ui"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputVal}
              disabled={isStreaming}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                language === "id"
                  ? "Tanyakan konsep, rumus, atau soal dari materi ini..."
                  : "Ask any question about this material..."
              }
              className="w-full h-11 rounded-full border border-input bg-background px-4 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={!inputVal.trim() || isStreaming}
            className="h-11 rounded-full px-5 font-semibold text-xs min-w-24 shadow-xs"
          >
            {isStreaming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <span>Kirim</span>
                <CornerDownLeft className="size-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </form>
      </section>

      {/* Floating Bottom Chat Bar only when card input is scrolled out of view */}
      {!isCardFormVisible && (
        <aside
          role="region"
          aria-label={
            language === "id"
              ? "Bar chat AI materi mengambang"
              : "Floating material AI chat bar"
          }
          className="fixed bottom-4 inset-x-0 mx-auto lg:left-64 w-[calc(100%-2rem)] max-w-3xl z-40 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="rounded-2xl border border-primary/30 bg-card/95 p-2.5 shadow-2xl backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10 font-ui">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputVal}
                  disabled={isStreaming}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    language === "id"
                      ? "Tanyakan konsep, rumus, atau soal dari materi ini..."
                      : "Ask any question about this material..."
                  }
                  className="w-full h-10 rounded-full border border-input bg-background/95 px-4 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                />
              </div>

              <Button
                type="submit"
                disabled={!inputVal.trim() || isStreaming}
                className="h-10 rounded-full px-5 font-semibold text-xs min-w-22 shadow-xs"
              >
                {isStreaming ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Kirim</span>
                    <CornerDownLeft className="size-3 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </aside>
      )}
    </>
  );
}
