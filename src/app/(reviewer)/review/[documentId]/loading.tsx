import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { ReviewDetailSkeleton } from "@/components/skeletons/PageSkeletons";

export default function ReviewDetailLoading() {
  return (
    <WorkspaceLoadingShell>
      <ReviewDetailSkeleton />
    </WorkspaceLoadingShell>
  );
}
