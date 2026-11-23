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
        setCount((prev) => (result.enrolled ? prev + 1 : Math.max(0, prev - 1)));
        const msg = result.message ?? "Status keikutsertaan mata kuliah berhasil diperbarui.";
        setFeedback(msg);
        announce(msg, "polite");
      } else if (result.error) {
        setFeedback(result.error);
        announce(result.error, "assertive");
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        {enrolled ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success font-ui">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>Terdaftar ({count} Mahasiswa)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground font-ui">
            <UserCheck className="size-3.5" aria-hidden="true" />
            <span>Belum Terdaftar ({count} Mahasiswa)</span>
          </span>
        )}
      </div>

      <Button
        type="button"
        size="sm"
        variant={enrolled ? "outline" : "default"}
        onClick={handleToggle}
        disabled={isPending}
        className="font-ui text-xs font-semibold h-8"
      >
        {isPending ? (
          <span>Memperbarui...</span>
        ) : enrolled ? (
          <>
            <LogOut className="size-3.5 mr-1.5 text-muted-foreground" aria-hidden="true" />
            <span>Batalkan Keanggotaan</span>
          </>
        ) : (
          <>
            <LogIn className="size-3.5 mr-1.5" aria-hidden="true" />
            <span>Gabung Mata Kuliah</span>
          </>
        )}
      </Button>

      {feedback && (
        <span className="text-xs text-muted-foreground font-ui animate-fadeIn" role="status">
          {feedback}
        </span>
      )}
    </div>
  );
}
