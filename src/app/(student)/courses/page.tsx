import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, FileUp, GraduationCap } from "lucide-react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { loadWorkspaceSnapshot, FALLBACK_COURSES } from "@/lib/data/workspace";
import { SHARED_REVIEWED_MATERIALS } from "@/lib/data/course-materials";
import { APP_IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "Mata Kuliah & Shared Materials",
};

const COURSE_IMAGES: Record<string, { src: string; alt: string; caption?: string }> = {
  "cs-201": APP_IMAGES.courseCS,
  "math-105": APP_IMAGES.courseMath,
  "stat-210": APP_IMAGES.courseStat,
};

async function CoursesBody() {
  const snapshot = await loadWorkspaceSnapshot();
  const courses = snapshot.courses.length > 0 ? snapshot.courses : FALLBACK_COURSES;

  return (
    <div className="mx-auto max-w-7xl space-y-8 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-border pb-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-ui">
            Katalog Mata Kuliah &bull; 3 Kelas Didukung
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Mata Kuliah &amp; Shared Reviewed Materials
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            Akses materi perkuliahan yang telah diverifikasi volunteer dan dapat digunakan bersama oleh mahasiswa tunanetra yang terdaftar.
          </p>
        </div>

        <Button asChild className="font-ui font-semibold shadow-xs">
          <Link href="/upload">
            <FileUp className="size-4 mr-2" aria-hidden="true" />
            <span>Unggah Materi Baru</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const courseImage = COURSE_IMAGES[course.id] ?? APP_IMAGES.courseCS;
          const sharedDocs = SHARED_REVIEWED_MATERIALS.filter((m) => m.courseId === course.id);

          return (
            <article
              key={course.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="relative aspect-16/9 w-full overflow-hidden bg-muted">
                  <Image
                    src={courseImage.src}
                    alt={courseImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold font-ui uppercase">
                      {course.code}
                    </span>
                    <p className="text-xs text-white/90 font-ui mt-1">{course.discipline}</p>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h2 className="font-heading text-lg font-bold text-foreground leading-snug">
                    <Link href={`/courses/${course.id}`} className="hover:text-primary transition-colors">
                      {course.title}
                    </Link>
                  </h2>

                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-sans">
                    {course.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs font-ui">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-success" />
                        <span>Materi Terverifikasi (Reusable)</span>
                      </span>
                      <strong className="text-foreground">{sharedDocs.length} Modul</strong>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="size-3.5 text-primary" />
                        <span>Status Akses Anda</span>
                      </span>
                      <span className="text-success font-semibold">Terdaftar (Penuh)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 p-5 pt-3 bg-surface-subtle/40 font-ui">
                <Button asChild size="sm" className="w-full justify-between font-semibold">
                  <Link href={`/courses/${course.id}`}>
                    <span>Buka Shared Materials</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <WorkspaceShell pageSectionLabel="Mata Kuliah">
      <Suspense fallback={<p className="text-sm text-muted-foreground font-ui">Memuat daftar mata kuliah...</p>}>
        <CoursesBody />
      </Suspense>
    </WorkspaceShell>
  );
}
