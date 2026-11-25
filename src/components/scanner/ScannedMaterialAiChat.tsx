"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { ChatMessageItem } from "@/components/scanner/ChatMessageItem";
import { ChatInputBar } from "@/components/scanner/ChatInputBar";
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
  const [isCardFormVisible, setIsCardFormVisible] = useState(false);

  const cardFormRef = useRef<HTMLFormElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const { currentlySpeakingId, speak } = useSpeechSynthesis({ language });

  // IntersectionObserver to toggle floating input bar smoothly
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

  const inputPlaceholder =
    language === "id"
      ? "Tanyakan konsep, rumus, atau soal dari materi ini..."
      : "Ask any question about this material...";

  return (
    <>
      <section
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
            {messages.map((msg: UIMessage) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isSpeaking={currentlySpeakingId === msg.id}
                onToggleSpeech={speak}
              />
            ))}

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
        <ChatInputBar
          ref={cardFormRef}
          value={inputVal}
          onChange={setInputVal}
          onSubmit={handleSendQuery}
          isStreaming={isStreaming}
          placeholder={inputPlaceholder}
          variant="card"
        />
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
          <div className="rounded-2xl border border-primary/30 bg-card/95 p-2.5 shadow-2xl backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
            <ChatInputBar
              value={inputVal}
              onChange={setInputVal}
              onSubmit={handleSendQuery}
              isStreaming={isStreaming}
              placeholder={inputPlaceholder}
              variant="floating"
            />
          </div>
        </aside>
      )}
    </>
  );
}
