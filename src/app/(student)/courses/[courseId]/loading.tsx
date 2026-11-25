import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { CourseDetailSkeleton } from "@/components/skeletons/PageSkeletons";

export default function CourseDetailLoading() {
  return (
    <WorkspaceLoadingShell>
      <CourseDetailSkeleton />
    </WorkspaceLoadingShell>
  );
}
