"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  FileUp,
  Headphones,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { cn } from "cn";
import type { AppRole } from "@/types/database";

interface MobileBottomNavProps {
  userRoles?: AppRole[];
}

export function MobileBottomNav({
  userRoles = ["student"],
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const isAdmin = userRoles.includes("admin");

  const leftItems = [
    { label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kuliah", href: "/courses", icon: BookOpen },
  ];

  const rightItems = [
    { label: "Reader", href: "/reader", icon: Headphones },
    isAdmin
      ? { label: "Admin", href: "/admin", icon: Shield }
      : { label: "Review", href: "/review", icon: CheckSquare },
  ];

  const isUploadActive = pathname === "/upload" || pathname.startsWith("/upload/");

  return (
    <nav
      aria-label="Navigasi Utama Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
    >
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-between px-3">
        {/* Menu Kiri: Beranda, Kuliah */}
        <div className="flex flex-1 justify-around">
          {leftItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-[56px] flex-col items-center justify-center py-1 text-[10px] font-medium font-ui transition-colors",
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-transform",
                    active ? "scale-110 text-primary" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Menu Tengah: Tombol Unggah PDF (Besar & Melayang Mirip UI DANA) */}
        <div className="relative -top-4 flex flex-col items-center justify-center px-2">
          <Link
            href="/upload"
            aria-label="Unggah Dokumen PDF"
            className={cn(
              "flex size-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isUploadActive
                ? "bg-primary text-primary-foreground ring-4 ring-background shadow-primary/40 scale-105"
                : "bg-primary text-primary-foreground ring-4 ring-background shadow-primary/30 hover:scale-105"
            )}
          >
            <FileUp className="size-6 shrink-0" aria-hidden="true" />
          </Link>
          <span
            className={cn(
              "mt-1 text-[10px] font-bold tracking-tight font-ui",
              isUploadActive ? "text-primary" : "text-foreground"
            )}
          >
            Unggah
          </span>
        </div>

        {/* Menu Kanan: Reader, Review / Admin */}
        <div className="flex flex-1 justify-around">
          {rightItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-[56px] flex-col items-center justify-center py-1 text-[10px] font-medium font-ui transition-colors",
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0 transition-transform",
                    active ? "scale-110 text-primary" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
