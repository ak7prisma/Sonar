import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { CoursesSkeleton } from "@/components/skeletons/PageSkeletons";

export default function CoursesLoading() {
  return (
    <WorkspaceLoadingShell>
      <CoursesSkeleton />
    </WorkspaceLoadingShell>
  );
}
