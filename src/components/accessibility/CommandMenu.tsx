"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  CircleHelp,
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

export function CommandMenu({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
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

  return (
    <>
      {compact ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Cari halaman (Ctrl+K)"
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
          <span className="hidden md:inline">Lompat cepat</span>
          <span className="sr-only md:hidden">Menu navigasi lompat cepat</span>
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground lg:inline">
            Ctrl+K
          </kbd>
        </Button>
      )}

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Menu Navigasi SONAR"
        description="Cari dan lompat langsung ke halaman SONAR mana pun."
      >
        <CommandInput placeholder="Cari halaman..." />
        <CommandList>
          <CommandEmpty>Tidak ada halaman yang cocok.</CommandEmpty>
          <CommandGroup heading="Halaman">
            {COMMAND_ROUTES.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
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
