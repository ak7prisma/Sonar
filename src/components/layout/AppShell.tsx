"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  FileUp,
  Headphones,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SonarLogo } from "@/components/shared/SonarLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { CommandMenu } from "@/components/accessibility/CommandMenu";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { signOutAction } from "@/features/authentication/actions";
import { initialsOf } from "@/lib/format";
import type { AppRole } from "@/types/database";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  access?: "reviewer" | "admin";
}

const MENU_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mata Kuliah", href: "/courses", icon: BookOpen },
  { label: "Unggah Materi", href: "/upload", icon: FileUp },
  { label: "Pembaca", href: "/reader", icon: Headphones },
  { label: "Antrean Review", href: "/review", icon: ClipboardCheck, access: "reviewer" },
  { label: "Administrasi", href: "/admin", icon: ShieldCheck, access: "admin" },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return (
    <ul className="space-y-1 font-ui">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                  : "text-foreground/85 hover:bg-brand-mint hover:text-brand-ink dark:hover:bg-muted dark:hover:text-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-tint-blue font-heading font-bold text-brand-ink",
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

function UserMenu({
  name,
  email,
  roleLabel,
}: {
  name: string;
  email?: string | null;
  roleLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2 rounded-full px-1.5 sm:pr-3"
        >
          <Avatar name={name} className="size-8 text-xs" />
          <span className="sr-only md:hidden">Menu akun {name}</span>
          <span className="hidden min-w-0 text-left leading-tight md:block">
            <span className="block max-w-36 truncate text-sm font-semibold text-foreground">
              {name}
            </span>
            <span className="block text-xs font-normal text-muted-foreground">{roleLabel}</span>
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-0.5 font-normal">
          <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
          {email ? (
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          ) : null}
          <span className="block text-xs text-muted-foreground">{roleLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="min-h-10 cursor-pointer">
            <Settings className="size-4" aria-hidden="true" />
            <span>Pengaturan membaca</span>
          </Link>
        </DropdownMenuItem>
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="min-h-10 w-full cursor-pointer">
              <LogOut className="size-4" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  children,
  userName,
  userEmail,
  userRoles = ["student"],
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  userRoles?: AppRole[];
}) {
  const pathname = usePathname();

  const isAdmin = userRoles.includes("admin");
  const isReviewer =
    isAdmin || userRoles.includes("reviewer") || userRoles.includes("volunteer");
  const roleLabel = isAdmin ? "Administrator" : isReviewer ? "Volunteer" : "Mahasiswa";
  const displayName =
    userName?.trim() || userEmail?.split("@")[0] || "Pengguna SONAR";

  const visibleMenu = MENU_ITEMS.filter((item) => {
    if (item.access === "admin") return isAdmin;
    if (item.access === "reviewer") return isReviewer;
    return true;
  });

  return (
    <div className="min-h-dvh overflow-x-clip bg-background lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link
            href="/dashboard"
            aria-label="SONAR, ke dashboard"
            className="inline-flex items-center rounded-md"
          >
            <SonarLogo variant="full" size="sm" />
          </Link>
        </div>

        <nav
          aria-label="Navigasi utama"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-4"
        >
          <div className="space-y-2">
            <p className="px-3 font-ui text-xs font-semibold text-muted-foreground">
              Menu
            </p>
            <NavList items={visibleMenu} pathname={pathname} />
          </div>
          <div className="space-y-2">
            <p className="px-3 font-ui text-xs font-semibold text-muted-foreground">
              Akun
            </p>
            <NavList items={ACCOUNT_ITEMS} pathname={pathname} />
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-xl bg-surface-subtle p-3">
              <Avatar name={displayName} className="size-10 text-sm" />
              <div className="min-w-0">
                <p className="truncate font-ui text-sm font-semibold text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="h-11 w-full justify-start gap-3 rounded-xl px-3 font-ui text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-5" aria-hidden="true" />
                <span>Keluar</span>
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border/80 bg-background/95 px-4 backdrop-blur sm:gap-3 sm:px-6">
          <Link
            href="/dashboard"
            aria-label="SONAR, ke dashboard"
            className="inline-flex shrink-0 items-center rounded-md lg:hidden"
          >
            <SonarLogo variant="mark" size="sm" />
          </Link>

          <div className="min-w-0 sm:max-w-md sm:flex-1">
            <CommandMenu bar />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <AccessibilityToolbar compact />
            <ThemeToggle />
            <UserMenu name={displayName} email={userEmail} roleLabel={roleLabel} />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 pb-28 outline-none sm:px-6 lg:px-8 lg:pb-10"
        >
          {children}
        </main>

        <MobileBottomNav userRoles={userRoles} />
      </div>
    </div>
  );
}
