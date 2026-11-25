import { Suspense, cache } from "react";
import { connection } from "next/server";
import {
  AppShell,
  HeaderUserMenu,
  RoleNavMenuItems,
  SidebarAccountSection,
} from "@/components/layout/AppShell";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import {
  HeaderUserSkeleton,
  SidebarAccountSkeleton,
} from "@/components/skeletons/PageSkeletons";
import { getAuthenticatedContext } from "@/lib/supabase/auth-helpers";
import { getCurrentAppUser } from "@/lib/auth/session";
import type { AppRole } from "@/types/database";

const getWorkspaceViewer = cache(async function getWorkspaceViewer() {
  await connection();
  const [{ auth }, demoUser] = await Promise.all([
    getAuthenticatedContext(),
    getCurrentAppUser(),
  ]);

  const userName = auth?.fullName ?? demoUser?.name ?? null;
  const userEmail = auth?.email ?? demoUser?.email ?? null;
  const userRoles: AppRole[] =
    auth?.roles ?? (demoUser ? [demoUser.role] : ["student"]);
  const isAdmin = userRoles.includes("admin");
  const isReviewer =
    isAdmin || userRoles.includes("reviewer") || userRoles.includes("volunteer");
  const roleLabel = isAdmin ? "Administrator" : isReviewer ? "Volunteer" : "Mahasiswa";

  return { userName, userEmail, userRoles, roleLabel };
});

async function ResolvedRoleNav() {
  const viewer = await getWorkspaceViewer();
  return <RoleNavMenuItems userRoles={viewer.userRoles} />;
}

async function ResolvedSidebarFooter() {
  const viewer = await getWorkspaceViewer();
  return (
    <SidebarAccountSection
      userName={viewer.userName}
      userEmail={viewer.userEmail}
      roleLabel={viewer.roleLabel}
    />
  );
}

async function ResolvedHeaderUser() {
  const viewer = await getWorkspaceViewer();
  return (
    <HeaderUserMenu
      userName={viewer.userName}
      userEmail={viewer.userEmail}
      roleLabel={viewer.roleLabel}
    />
  );
}

async function ResolvedMobileNav() {
  const viewer = await getWorkspaceViewer();
  return <MobileBottomNav userRoles={viewer.userRoles} />;
}

/**
 * Renders the static workspace navigation chrome immediately so page content
 * streams in parallel with user identity slots without auth-then-data waterfalls.
 */
export function WorkspaceShell({
  children,
}: {
  children: React.ReactNode;
  /** Kept for call-site compatibility; route loading uses per-page Suspense fallbacks. */
  pageSectionLabel?: string;
}) {
  return (
    <AppShell
      roleNavSlot={
        <Suspense fallback={null}>
          <ResolvedRoleNav />
        </Suspense>
      }
      sidebarFooterSlot={
        <Suspense fallback={<SidebarAccountSkeleton />}>
          <ResolvedSidebarFooter />
        </Suspense>
      }
      headerUserSlot={
        <Suspense fallback={<HeaderUserSkeleton />}>
          <ResolvedHeaderUser />
        </Suspense>
      }
      mobileNavSlot={
        <Suspense fallback={<MobileBottomNav />}>
          <ResolvedMobileNav />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
