"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  FileUp,
  Headphones,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "cn";
import type { AppRole } from "@/types/database";
import { useTranslation } from "@/lib/i18n/use-translation";

interface MobileBottomNavProps {
  userRoles?: AppRole[];
}

function MobileBottomNavInner({
  userRoles = ["student"],
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isEn } = useTranslation();
  const isAdmin = userRoles.includes("admin");
  const isVolunteer = !isAdmin && userRoles.includes("volunteer");

  if (isVolunteer) {
    const volunteerItems = [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: isEn ? "Review" : "Antrean Review", href: "/review", icon: ClipboardCheck },
      { label: isEn ? "Settings" : "Pengaturan", href: "/settings", icon: Settings },
    ];

    return (
      <nav
        aria-label="Navigasi utama seluler volunteer"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden shadow-[0_-4px_16px_rgb(41_59_57/0.06)]"
      >
        <div className="relative mx-auto flex h-16 max-w-md items-center justify-around px-2 font-ui">
          {volunteerItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  const leftItems = [
    { label: "Dashboard", href: isAdmin ? "/admin" : "/dashboard", icon: LayoutDashboard },
    { label: isEn ? "Courses" : "Kuliah", href: "/courses", icon: BookOpen },
  ];

  const trailingItem = isAdmin
    ? { label: isEn ? "Review" : "Review", href: "/review", icon: ClipboardCheck }
    : { label: isEn ? "Settings" : "Setelan", href: "/settings", icon: Settings };

  const rightItems = [
    { label: isEn ? "Reader" : "Pembaca", href: "/reader", icon: Headphones },
    trailingItem,
  ];

  const isUploadActive = pathname === "/upload" || pathname.startsWith("/upload/");

  return (
    <nav
      aria-label="Navigasi utama seluler"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden shadow-[0_-4px_16px_rgb(41_59_57/0.06)]"
    >
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-between px-2 font-ui">
        <div className="flex flex-1 justify-around">
          {leftItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 min-w-14 flex-col items-center justify-center rounded-lg px-1 py-1 text-xs font-medium transition-colors",
                  active
                    ? "font-bold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="mt-0.5 leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="relative -top-3.5 flex flex-col items-center justify-center px-2">
          <Link
            href="/upload"
            aria-label={isEn ? "Upload PDF material" : "Unggah materi PDF"}
            aria-current={isUploadActive ? "page" : undefined}
            className={cn(
              "flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background transition-transform active:scale-95",
              isUploadActive && "ring-brand-mint"
            )}
          >
            <FileUp className="size-5 shrink-0" aria-hidden="true" />
          </Link>
          <span
            className={cn(
              "mt-1 text-xs font-semibold leading-none",
              isUploadActive ? "text-primary" : "text-foreground"
            )}
          >
            {isEn ? "Upload" : "Unggah"}
          </span>
        </div>

        <div className="flex flex-1 justify-around">
          {rightItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 min-w-14 flex-col items-center justify-center rounded-lg px-1 py-1 text-xs font-medium transition-colors",
                  active
                    ? "font-bold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="mt-0.5 leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function MobileBottomNav({ userRoles = ["student"] }: MobileBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner userRoles={userRoles} />
    </Suspense>
  );
}
