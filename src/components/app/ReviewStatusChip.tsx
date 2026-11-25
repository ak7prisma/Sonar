import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "cn";
import type { ProcessingStatus, ReviewStatus } from "@/types/database";

type ChipStatus = ReviewStatus | ProcessingStatus;

const CHIP_MAP: Record<
  string,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  verified: {
    label: "Terverifikasi",
    className: "bg-brand-mint text-brand-ink border-brand-teal/40",
    icon: CheckCircle2,
  },
  unreviewed: {
    label: "Menunggu review",
    className: "bg-tint-gold text-brand-ink border-brand-gold",
    icon: Clock,
  },
  in_review: {
    label: "Sedang ditinjau",
    className: "bg-tint-blue text-brand-ink border-brand-blue/50",
    icon: Eye,
  },
  needs_revision: {
    label: "Perlu perbaikan",
    className: "bg-tint-peach text-brand-ink border-brand-peach",
    icon: AlertTriangle,
  },
  queued: {
    label: "Dalam antrean",
    className: "bg-muted text-foreground border-border",
    icon: Clock,
  },
  extracting: {
    label: "Memproses",
    className: "bg-tint-blue text-brand-ink border-brand-blue/50",
    icon: Loader2,
  },
  ocr: {
    label: "Memproses",
    className: "bg-tint-blue text-brand-ink border-brand-blue/50",
    icon: Loader2,
  },
  structuring: {
    label: "Memproses",
    className: "bg-tint-blue text-brand-ink border-brand-blue/50",
    icon: Loader2,
  },
  enriching: {
    label: "Memproses",
    className: "bg-tint-blue text-brand-ink border-brand-blue/50",
    icon: Loader2,
  },
  embedding: {
    label: "Memproses",
    className: "bg-tint-blue text-brand-ink border-brand-blue/50",
    icon: Loader2,
  },
  completed: {
    label: "Siap dibaca",
    className: "bg-brand-mint text-brand-ink border-brand-teal/40",
    icon: CheckCircle2,
  },
  failed: {
    label: "Gagal diproses",
    className: "bg-tint-peach text-brand-ink border-brand-peach",
    icon: XCircle,
  },
};

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  verified: "Terverifikasi",
  unreviewed: "Menunggu review",
  in_review: "Sedang ditinjau",
  needs_revision: "Perlu perbaikan",
};

/** Compact status pill. Always shows icon + text (never color alone). */
export function ReviewStatusChip({
  status,
  className,
}: {
  status: ChipStatus;
  className?: string;
}) {
  const config = CHIP_MAP[status] ?? CHIP_MAP.queued;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none whitespace-nowrap",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
