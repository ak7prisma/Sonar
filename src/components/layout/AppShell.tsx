"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  FileUp,
  Headphones,
  LayoutDashboard,
  LogOut,
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
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
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
  { label: "Mata Kuliah & Materi", href: "/courses", icon: BookOpen, badge: "3 Kuliah" },
  { label: "Unggah Dokumen PDF", href: "/upload", icon: FileUp },
  { label: "Accessible Reader", href: "/reader", icon: Headphones },
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
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  const isVolunteer = userRoles.includes("reviewer") || userRoles.includes("volunteer");
  const isAdmin = userRoles.includes("admin");

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    return item.roles.some((role) => userRoles.includes(role));
  });

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Desktop Sidebar (Sticky on viewport) */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Link
            href="/dashboard"
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
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold font-ui",
                    isVolunteer
                      ? "bg-tint-peach text-brand-ink"
                      : isAdmin
                        ? "bg-tint-blue text-brand-ink"
                        : "bg-brand-mint text-brand-ink"
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
        {/* Mobile & Desktop Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="SONAR beranda"
              className="inline-flex items-center lg:hidden"
            >
              <SonarLogo size="sm" />
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

            {/* Mobile Profile & Logout Trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileProfileOpen} onOpenChange={setMobileProfileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="relative size-8 rounded-full border border-primary/20 bg-primary/10 font-bold text-xs text-primary font-heading"
                    aria-label="Buka profil dan pengaturan akun"
                  >
                    {isVolunteer ? "DS" : isAdmin ? "HG" : "AF"}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0">
                  <SheetHeader className="border-b px-5 py-4 text-left">
                    <SheetTitle>
                      <SonarLogo size="sm" />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-4 border-b border-border space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center font-bold text-primary font-heading">
                        {isVolunteer ? "DS" : isAdmin ? "HG" : "AF"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-ui">
                          {isVolunteer ? "Dewi Sartika, S.Kom." : isAdmin ? "Dr. Hendra Gunawan" : "Ahmad Fauzi"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isVolunteer ? "Volunteer Reviewer" : isAdmin ? "Administrator" : "Mahasiswa Tunanetra"}
                        </p>
                      </div>
                    </div>
                    {userEmail && (
                      <p className="text-[11px] text-muted-foreground font-mono pt-1">
                        {userEmail}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 p-4 space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-foreground font-ui">
                        Ganti Peran Demo
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        <form action={() => { loginAsDemoRole("student"); setMobileProfileOpen(false); }}>
                          <Button
                            type="submit"
                            variant={!isVolunteer && !isAdmin ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-full px-1 text-xs font-ui"
                          >
                            Student
                          </Button>
                        </form>
                        <form action={() => { loginAsDemoRole("volunteer"); setMobileProfileOpen(false); }}>
                          <Button
                            type="submit"
                            variant={isVolunteer ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-full px-1 text-xs font-ui"
                          >
                            Volunteer
                          </Button>
                        </form>
                        <form action={() => { loginAsDemoRole("admin"); setMobileProfileOpen(false); }}>
                          <Button
                            type="submit"
                            variant={isAdmin ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-full px-1 text-xs font-ui"
                          >
                            Admin
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-border">
                    <form action={signOutAction}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs text-muted-foreground hover:text-destructive font-ui"
                      >
                        <LogOut className="mr-2 size-3.5" aria-hidden="true" />
                        <span>Keluar dari Akun</span>
                      </Button>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main Content Area (pb-24 on mobile so bottom nav does not block content) */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none pb-28 lg:pb-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>

        {/* Footer (mb-16 on mobile so not covered by bottom nav) */}
        <footer className="border-t bg-surface-subtle px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8 font-ui mb-16 lg:mb-0">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <p>SONAR — Platform Materi Perkuliahan Aksesibel untuk Mahasiswa Tunanetra</p>
            <p>Standar WCAG 2.2 Level AA · Terverifikasi Screen Reader & Audio Bilingual</p>
          </div>
        </footer>

        {/* Mobile Bottom Navigation (Mirip DANA) */}
        <Suspense fallback={null}>
          <MobileBottomNav userRoles={userRoles} />
        </Suspense>
      </div>
    </div>
  );
}
