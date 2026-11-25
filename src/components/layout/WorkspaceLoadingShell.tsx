import { AppShell } from "@/components/layout/AppShell";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import {
  HeaderUserSkeleton,
  SidebarAccountSkeleton,
} from "@/components/skeletons/PageSkeletons";

/**
 * Instant, database-free loading chrome used by route `loading.tsx` files so
 * client navigations preserve sidebar and topbar geometry without flicker.
 */
export function WorkspaceLoadingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      roleNavSlot={null}
      sidebarFooterSlot={<SidebarAccountSkeleton />}
      headerUserSlot={<HeaderUserSkeleton />}
      mobileNavSlot={<MobileBottomNav />}
    >
      {children}
    </AppShell>
  );
}
