import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { AdminSkeleton } from "@/components/skeletons/PageSkeletons";

export default function AdminLoading() {
  return (
    <WorkspaceLoadingShell>
      <AdminSkeleton />
    </WorkspaceLoadingShell>
  );
}
