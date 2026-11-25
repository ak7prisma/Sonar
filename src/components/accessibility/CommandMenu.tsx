"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  CircleHelp,
  FileText,
  FileUp,
  Home,
  Info,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchCourse {
  id: string;
  code: string;
  title: string;
  discipline: string;
}

interface SearchDocument {
  id: string;
  title: string;
  courseId: string;
  status: string;
}

const COMMAND_ROUTES = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Dashboard Mahasiswa", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mata Kuliah & Materi Reusable", href: "/courses", icon: BookOpen },
  { label: "Unggah Dokumen PDF", href: "/upload", icon: FileUp },
  { label: "Accessible Reader", href: "/reader", icon: BookOpen },
  { label: "Antrean Review Volunteer", href: "/review", icon: CheckSquare },
  { label: "Pengaturan Membaca & Akun", href: "/settings", icon: Settings },
  { label: "Konsol Administrasi", href: "/admin", icon: Shield },
  { label: "Cara Kerja SONAR", href: "/how-it-works", icon: Info },
  { label: "Pernyataan Aksesibilitas", href: "/accessibility", icon: ShieldCheck },
  { label: "Pusat Bantuan", href: "/help", icon: CircleHelp },
];

export function CommandMenu({
  compact = false,
  bar = false,
}: {
  compact?: boolean;
  /** Wide pill-shaped search field used in the workspace header. */
  bar?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<SearchCourse[]>([]);
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fetch searchable courses and documents when dialog is opened
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    fetch("/api/search")
      .then((res) => (res.ok ? res.json() : { courses: [], documents: [] }))
      .then((data: { courses?: SearchCourse[]; documents?: SearchDocument[] }) => {
        if (!isMounted) return;
        if (data.courses) setCourses(data.courses);
        if (data.documents) setDocuments(data.documents);
      })
      .catch(() => {
        // Fallback silently if offline or error
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleNavigate = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      {bar ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex size-10 items-center justify-center gap-2.5 rounded-full border border-border bg-card text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground sm:h-11 sm:w-full sm:justify-start sm:px-4"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <span className="hidden flex-1 truncate text-left sm:inline">
            Cari materi, mata kuliah, halaman…
          </span>
          <span className="sr-only sm:hidden">Cari materi atau halaman</span>
          <kbd
            aria-hidden="true"
            className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground lg:inline"
          >
            Ctrl K
          </kbd>
        </button>
      ) : compact ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Cari materi & halaman (Ctrl+K)"
          aria-haspopup="dialog"
          className="text-muted-foreground hover:text-foreground"
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden md:inline">Cari materi &amp; halaman</span>
          <span className="sr-only md:hidden">Pencarian cepat</span>
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground lg:inline">
            Ctrl+K
          </kbd>
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Pencarian Global SONAR"
        description="Cari materi kuliah, mata kuliah terdaftar, atau lompat langsung ke halaman SONAR."
      >
        <CommandInput placeholder="Ketik kata kunci materi, mata kuliah, atau halaman..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil yang cocok.</CommandEmpty>

          {/* Group 1: Materi & Dokumen Kuliah */}
          {documents.length > 0 && (
            <CommandGroup heading="Materi &amp; Dokumen Kuliah">
              {documents.map((doc) => (
                <CommandItem
                  key={`doc-${doc.id}`}
                  value={`${doc.title} ${doc.courseId} materi dokumen`}
                  onSelect={() => handleNavigate(`/reader?id=${doc.id}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground shrink-0 uppercase tracking-wider ml-2">
                    {doc.status === "verified" ? "Terverifikasi" : "Draft AI"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Group 2: Mata Kuliah */}
          {courses.length > 0 && (
            <CommandGroup heading="Mata Kuliah">
              {courses.map((course) => (
                <CommandItem
                  key={`course-${course.id}`}
                  value={`${course.code} ${course.title} ${course.discipline} kuliah`}
                  onSelect={() => handleNavigate(`/courses`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="font-semibold text-foreground">{course.code}</span>
                    <span className="truncate text-muted-foreground">— {course.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {course.discipline}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Group 3: Navigasi Halaman */}
          <CommandGroup heading="Halaman &amp; Fitur">
            {COMMAND_ROUTES.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.label} navigasi`}
                  onSelect={() => handleNavigate(item.href)}
                >
                  <Icon className="mr-2 size-4 text-primary" aria-hidden="true" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
