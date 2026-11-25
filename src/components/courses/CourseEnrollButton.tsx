"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, LogIn, LogOut, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleCourseEnrollmentAction } from "@/features/courses/actions";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

interface CourseEnrollButtonProps {
  courseId: string;
  initialEnrolled: boolean;
  memberCount: number;
}

export function CourseEnrollButton({
  courseId,
  initialEnrolled,
  memberCount,
}: CourseEnrollButtonProps) {
  const { announce } = useLiveAnnouncer();
  const [isPending, startTransition] = useTransition();
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [count, setCount] = useState(memberCount);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCourseEnrollmentAction(courseId);
      if (result.success && result.enrolled !== undefined) {
        setEnrolled(result.enrolled);
        setCount((prev) =>
          result.enrolled ? prev + 1 : Math.max(0, prev - 1)
        );
        const msg = result.enrolled
          ? "Berhasil terdaftar pada mata kuliah ini."
          : "Keanggotaan pada mata kuliah ini dibatalkan.";
        setFeedback(msg);
        announce(msg, "polite");
      } else if (result.error) {
        setFeedback(result.error);
        announce(result.error, "assertive");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 font-ui">
      {enrolled ? (
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-brand-teal/40 bg-brand-mint px-3 py-1 text-xs font-semibold text-brand-ink">
          <CheckCircle2 className="size-3.5 text-brand-teal" aria-hidden="true" />
          <span>Terdaftar ({count} anggota)</span>
        </span>
      ) : (
        <span className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
          <UserCheck className="size-3.5" aria-hidden="true" />
          <span>Belum terdaftar ({count} anggota)</span>
        </span>
      )}

      <Button
        type="button"
        size="sm"
        variant={enrolled ? "outline" : "default"}
        onClick={handleToggle}
        disabled={isPending}
        className="min-h-10 rounded-full px-4 text-xs font-semibold"
      >
        {isPending ? (
          <span>Memperbarui…</span>
        ) : enrolled ? (
          <>
            <LogOut className="size-3.5" aria-hidden="true" />
            <span>Keluar dari Kelas</span>
          </>
        ) : (
          <>
            <LogIn className="size-3.5" aria-hidden="true" />
            <span>Gabung Mata Kuliah</span>
          </>
        )}
      </Button>

      {feedback ? (
        <span className="text-xs text-muted-foreground" role="status">
          {feedback}
        </span>
      ) : null}
    </div>
  );
}
