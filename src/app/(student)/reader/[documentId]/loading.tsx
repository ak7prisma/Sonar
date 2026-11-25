import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { ReaderSkeleton } from "@/components/skeletons/PageSkeletons";

export default function ReaderDocumentLoading() {
  return (
    <WorkspaceLoadingShell>
      <ReaderSkeleton />
    </WorkspaceLoadingShell>
  );
}
