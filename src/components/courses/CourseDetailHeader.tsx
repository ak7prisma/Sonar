"use client";

import Link from "next/link";
import { FileUp } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";

interface CourseDetailHeaderProps {
  courseId: string;
  courseTitle: string;
  courseDescription?: string;
}

export function CourseDetailHeader({
  courseId,
  courseTitle,
  courseDescription,
}: CourseDetailHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      backHref="/courses"
      backLabel={t("allCourses")}
      title={courseTitle}
      description={courseDescription}
      actions={
        <Button asChild className="min-h-10 rounded-full px-5 font-ui font-semibold">
          <Link href={`/upload?courseId=${courseId}`}>
            <FileUp className="size-4" aria-hidden="true" />
            <span>{t("uploadPdfMaterial")}</span>
          </Link>
        </Button>
      }
    />
  );
}
