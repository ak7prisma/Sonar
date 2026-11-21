"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  FileUp,
  HelpCircle,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  UserCheck,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SonarLogo } from "@/components/shared/SonarLogo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { AccessibilityToolbar } from "@/components/accessibility/AccessibilityToolbar";
import { CommandMenu } from "@/components/accessibility/CommandMenu";
import { loginAsDemoRole, signOutAction } from "@/features/authentication/actions";
import type { AppRole } from "@/types/database";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: AppRole[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mata Kuliah & Materi Reusable", href: "/courses", icon: BookOpen, badge: "3 Kuliah" },
  { label: "Unggah Dokumen PDF", href: "/upload", icon: FileUp },
  { label: "Accessible Reader", href: "/reader", icon: BookOpen },
  {
    label: "Review Queue Volunteer",
    href: "/review",
    icon: CheckSquare,
    badge: "Volunteer",
  },
  {
    label: "Admin & Tata Kelola",
    href: "/admin",
    icon: Shield,
    roles: ["admin"],
  },
  { label: "Pengaturan Membaca", href: "/settings", icon: Settings },
  { label: "Panduan & Help Center", href: "/help", icon: HelpCircle },
  { label: "Tentang SONAR", href: "/about", icon: Info },
];

function WorkspaceNavList({
  visibleItems,
  onNavigate,
}: {
  visibleItems: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1 font-ui">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary-foreground" : "text-primary"
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-secondary text-primary"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppShell({
  children,
  userEmail,
  userRoles = ["student"],
  pageSectionLabel,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
  userRoles?: AppRole[];
  pageSectionLabel?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isVolunteer = userRoles.includes("reviewer") || userRoles.includes("volunteer");
  const isAdmin = userRoles.includes("admin");

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    return item.roles.some((role) => userRoles.includes(role));
  });

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link
            href="/"
            aria-label="SONAR beranda"
            className="inline-flex items-center rounded-md py-1"
          >
            <SonarLogo size="sm" />
          </Link>
        </div>

        {/* User Role Card */}
        <div className="border-b border-sidebar-border p-4 bg-surface-subtle/50">
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary font-heading">
              {isVolunteer ? "DS" : isAdmin ? "HG" : "AF"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground font-ui">
                {isVolunteer ? "Dewi Sartika, S.Kom." : isAdmin ? "Dr. Hendra Gunawan" : "Ahmad Fauzi"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium font-ui",
                    isVolunteer
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                      : isAdmin
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                      : "bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300"
                  )}
                >
                  <UserCheck className="size-3" aria-hidden="true" />
                  {isVolunteer ? "Volunteer Reviewer" : isAdmin ? "Administrator" : "Mahasiswa Tunanetra"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navigasi Workspace SONAR"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          <Suspense fallback={null}>
            <WorkspaceNavList visibleItems={visibleItems} />
          </Suspense>
        </nav>

        {/* Role Switcher & Sign Out */}
        <div className="border-t border-sidebar-border p-4 space-y-3 bg-surface-subtle/30">
          {userEmail && (
            <p className="truncate text-[11px] text-muted-foreground font-mono">
              {userEmail}
            </p>
          )}
          <div className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-ui">
              Ganti Peran Demo
            </p>
            <div className="grid grid-cols-3 gap-1">
              <form action={() => loginAsDemoRole("student")}>
                <Button
                  type="submit"
                  variant={!isVolunteer && !isAdmin ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs h-7 px-1 font-ui"
                >
                  Student
                </Button>
              </form>
              <form action={() => loginAsDemoRole("volunteer")}>
                <Button
                  type="submit"
                  variant={isVolunteer ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs h-7 px-1 font-ui"
                >
                  Volunteer
                </Button>
              </form>
              <form action={() => loginAsDemoRole("admin")}>
                <Button
                  type="submit"
                  variant={isAdmin ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs h-7 px-1 font-ui"
                >
                  Admin
                </Button>
              </form>
            </div>
          </div>

          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-destructive font-ui"
            >
              <LogOut className="size-3.5 mr-2" aria-hidden="true" />
              <span>Keluar dari Akun</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Buka menu navigasi"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="border-b px-5 py-4 text-left">
                  <SheetTitle>
                    <SonarLogo size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <nav aria-label="Navigasi Mobile" className="p-4">
                  <Suspense fallback={null}>
                    <WorkspaceNavList
                      visibleItems={visibleItems}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </Suspense>
                </nav>
              </SheetContent>
            </Sheet>

            <Link
              href="/"
              aria-label="SONAR beranda"
              className="inline-flex items-center lg:hidden"
            >
              <SonarLogo variant="mark" size="sm" />
            </Link>

            {pageSectionLabel ? (
              <span className="hidden text-sm font-semibold text-foreground font-ui sm:inline">
                {pageSectionLabel}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <CommandMenu />
            <AccessibilityToolbar />
            <ThemeToggle />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>

        <footer className="border-t bg-surface-subtle px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8 font-ui">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <p>SONAR — Platform Materi Perkuliahan Aksesibel untuk Mahasiswa Tunanetra</p>
            <p>Standar WCAG 2.2 Level AA · Terverifikasi Screen Reader & Audio Bilingual</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
