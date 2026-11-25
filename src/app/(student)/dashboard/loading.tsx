import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { DashboardSkeleton } from "@/components/skeletons/PageSkeletons";

export default function DashboardLoading() {
  return (
    <WorkspaceLoadingShell>
      <DashboardSkeleton />
    </WorkspaceLoadingShell>
  );
}
