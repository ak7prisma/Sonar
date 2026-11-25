import { WorkspaceLoadingShell } from "@/components/layout/WorkspaceLoadingShell";
import { SettingsSkeleton } from "@/components/skeletons/PageSkeletons";

export default function SettingsLoading() {
  return (
    <WorkspaceLoadingShell>
      <SettingsSkeleton />
    </WorkspaceLoadingShell>
  );
}
