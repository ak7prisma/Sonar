import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { ReviewQueueSkeleton } from "@/components/skeletons/PageSkeletons";

export default function ReviewQueueLoading() {
  return (
    <WorkspaceLoadingShell>
      <ReviewQueueSkeleton />
    </WorkspaceLoadingShell>
  );
}
