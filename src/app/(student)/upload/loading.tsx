import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { UploadSkeleton } from "@/components/skeletons/PageSkeletons";

export default function UploadLoading() {
  return (
    <WorkspaceLoadingShell>
      <UploadSkeleton />
    </WorkspaceLoadingShell>
  );
}
