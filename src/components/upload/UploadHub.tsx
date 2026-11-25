"use client";

import type { CourseRow } from "@/lib/data/workspace";
import { OcrDocumentScanner } from "@/components/scanner/OcrDocumentScanner";

interface UploadHubProps {
  courses: CourseRow[];
  defaultCourseId?: string;
  initialMode?: "ocr" | "pdf";
}

export function UploadHub({
  courses,
  defaultCourseId,
}: UploadHubProps) {
  return (
    <div className="space-y-5">
      <OcrDocumentScanner
        courses={courses}
        defaultCourseId={defaultCourseId}
      />
    </div>
  );
}
