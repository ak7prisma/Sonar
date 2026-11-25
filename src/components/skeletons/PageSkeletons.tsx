import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { cn } from "cn";

function SkeletonStatus({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("font-sans", className)}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function PageHeaderSkeleton({
  hasBack = false,
  hasAction = false,
}: {
  hasBack?: boolean;
  hasAction?: boolean;
}) {
  return (
    <div className="space-y-3">
      {hasBack ? <Skeleton className="h-5 w-36 rounded-md" /> : null}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl sm:h-9 sm:w-80" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md sm:w-[28rem]" />
        </div>
        {hasAction ? <Skeleton className="h-10 w-40 shrink-0 rounded-full" /> : null}
      </div>
    </div>
  );
}

export function HeaderUserSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-11 items-center gap-2 rounded-full px-1.5 sm:pr-3"
    >
      <Skeleton className="size-8 rounded-full bg-tint-blue/70" />
      <div className="hidden space-y-1.5 md:block">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
    </div>
  );
}

export function SidebarAccountSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-2">
      <div className="flex items-center gap-3 rounded-xl bg-surface-subtle p-3">
        <Skeleton className="size-10 shrink-0 rounded-full bg-tint-blue/70" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat ringkasan materi dan kelas dashboard…"
      className="w-full max-w-7xl space-y-8"
    >
      {/* Greeting row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56 rounded-xl" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
        </div>
        <Skeleton className="hidden h-10 w-36 rounded-full sm:block" />
      </div>

      {/* Mata Kuliah Utama (Top Left) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded-md bg-brand-mint/70" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-4/5 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
              <div className="mt-4 border-t border-border/70 pt-3">
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue-reading spotlight banner */}
      <div className="overflow-hidden rounded-3xl bg-brand-teal/20 p-6 sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-12">
          <div className="space-y-4 md:col-span-7">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-brand-gold/60" />
              <Skeleton className="h-6 w-28 rounded-full bg-brand-mint/70" />
            </div>
            <Skeleton className="h-8 w-5/6 rounded-xl bg-brand-teal/25" />
            <Skeleton className="h-4 w-4/5 rounded-md bg-brand-teal/20" />
            <Skeleton className="h-11 w-44 rounded-full bg-card/80" />
          </div>
          <div className="md:col-span-5">
            <Skeleton className="aspect-16/9 min-h-44 w-full rounded-2xl bg-brand-teal/20" />
          </div>
        </div>
      </div>

      {/* Two-zone body */}
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-7 w-44 rounded-lg" />
            <div className="flex gap-1.5">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>

          <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full bg-brand-mint/70" />
                    <Skeleton className="h-3.5 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                </div>
                <Skeleton className="size-9 rounded-full sm:w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-36 rounded-lg" />
            <div className="space-y-2.5 rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-18 w-full rounded-xl" />
              <Skeleton className="h-18 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonStatus>
  );
}

export function CoursesSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat daftar mata kuliah dan materi terverifikasi…"
      className="w-full max-w-7xl space-y-8"
    >
      <PageHeaderSkeleton hasAction />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <div>
              <Skeleton className="aspect-16/9 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-18 rounded-full bg-brand-mint/70" />
                  <Skeleton className="h-4 w-28 rounded-md" />
                </div>
                <Skeleton className="h-6 w-5/6 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <div className="space-y-2 border-t border-border/70 pt-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-border/70 bg-surface-subtle/50 p-4">
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonStatus>
  );
}

export function CourseDetailSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat detail dan daftar materi mata kuliah…"
      className="w-full max-w-7xl space-y-6"
    >
      <PageHeaderSkeleton hasBack hasAction />

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-full bg-brand-mint/70" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-40 rounded-lg" />
        {[1, 2, 3].map((row) => (
          <div
            key={row}
            className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex-1 space-y-2.5">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
              <Skeleton className="h-10 w-40 shrink-0 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonStatus>
  );
}

export function UploadSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat ruang unggah materi perkuliahan…"
      className="w-full max-w-5xl space-y-6 py-2 sm:py-4"
    >
      <div className="flex flex-col items-start space-y-2 text-left">
        <Skeleton className="h-8 w-64 rounded-xl sm:h-9 sm:w-80" />
        <Skeleton className="h-4 w-full max-w-md rounded-md" />
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="flex justify-start">
          <Skeleton className="h-11 w-72 rounded-2xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-11 w-44 rounded-full" />
      </div>
    </SkeletonStatus>
  );
}

export function ReaderSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat pembaca dokumen terstruktur…"
      className="w-full max-w-7xl space-y-6"
    >
      {/* Reader control strip - Left aligned */}
      <div className="flex flex-wrap items-center justify-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full bg-brand-mint/70" />
        </div>
      </div>

      {/* Left-aligned reading canvas */}
      <div className="w-full max-w-4xl space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-10">
        <div className="space-y-3 border-b border-border/70 pb-6">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full bg-brand-mint/70" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
          <Skeleton className="h-9 w-5/6 rounded-xl" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-7 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <Skeleton className="h-24 w-full rounded-2xl bg-surface-subtle" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
      </div>
    </SkeletonStatus>
  );
}

export function ReviewQueueSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat antrean review volunteer…"
      className="w-full max-w-7xl space-y-6"
    >
      <PageHeaderSkeleton />

      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>

        <div className="divide-y divide-border/70">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 py-4">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                </div>
                <Skeleton className="h-5 w-2/3 rounded-md" />
              </div>
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonStatus>
  );
}

export function ReviewDetailSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat editor review dokumen…"
      className="w-full max-w-7xl space-y-6"
    >
      <PageHeaderSkeleton hasBack />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card xl:col-span-4">
          <Skeleton className="h-6 w-36 rounded-md" />
          {[1, 2, 3, 4, 5].map((blk) => (
            <Skeleton key={blk} className="h-16 w-full rounded-xl" />
          ))}
        </div>

        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card xl:col-span-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </SkeletonStatus>
  );
}

export function SettingsSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat pengaturan membaca dan aksesibilitas…"
      className="w-full max-w-5xl space-y-6"
    >
      <PageHeaderSkeleton />

      {[1, 2, 3].map((panel) => (
        <div
          key={panel}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          <div className="grid gap-3 pt-2 sm:grid-cols-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </SkeletonStatus>
  );
}

export function AdminSkeleton() {
  return (
    <SkeletonStatus
      label="Memuat konsol administrasi mata kuliah dan dokumen…"
      className="w-full max-w-7xl space-y-6"
    >
      <PageHeaderSkeleton />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((metric) => (
          <div
            key={metric}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <Skeleton className="size-12 shrink-0 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-12 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="h-18 w-full rounded-xl" />
            <Skeleton className="h-18 w-full rounded-xl" />
            <Skeleton className="h-18 w-full rounded-xl" />
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
            <Skeleton className="h-6 w-56 rounded-lg" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </SkeletonStatus>
  );
}

export function AuthFormSkeleton() {
  return (
    <SkeletonStatus label="Memuat formulir akun…" className="space-y-4 py-1">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
    </SkeletonStatus>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="size-9 rounded-full" />
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-12 outline-none"
      >
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
          <AuthFormSkeleton />
        </div>
      </main>
    </div>
  );
}

export function PublicPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-12 outline-none sm:px-8"
      >
        <SkeletonStatus label="Memuat konten halaman…" className="space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-11 w-4/5 rounded-xl" />
            <Skeleton className="h-5 w-3/4 max-w-2xl rounded-md" />
          </div>
          <Skeleton className="aspect-21/9 w-full rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <Skeleton className="size-11 rounded-2xl" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
              </div>
            ))}
          </div>
        </SkeletonStatus>
      </main>
      <SiteFooter />
    </div>
  );
}
