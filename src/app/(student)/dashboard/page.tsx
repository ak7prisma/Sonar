import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { DashboardSkeleton } from "@/components/skeletons/PageSkeletons";
import { StudentDashboardView } from "@/components/dashboard/StudentDashboardView";
import { VolunteerDashboardView } from "@/components/dashboard/VolunteerDashboardView";
import { loadWorkspaceSnapshot } from "@/lib/data/workspace";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function DashboardBody() {
  const snapshot = await loadWorkspaceSnapshot();

  const displayName =
    snapshot.user?.fullName?.trim() ||
    snapshot.user?.email?.split("@")[0] ||
    "Pengguna SONAR";
  const greetingName = displayName.split(",")[0].trim() || displayName;

  const userRoles = snapshot.user?.roles ?? ["student"];
  const isAdmin = userRoles.includes("admin");
  const isVolunteer = !isAdmin && userRoles.includes("volunteer");

  // If user is an admin, redirect directly to the platform admin workspace
  if (isAdmin) {
    redirect("/admin");
  }

  // If user is a volunteer, show the dedicated volunteer curation dashboard
  if (isVolunteer) {
    return (
      <VolunteerDashboardView
        displayName={greetingName}
        documents={snapshot.documents}
        courses={snapshot.courses}
      />
    );
  }

  const canReview =
    userRoles.includes("admin") ||
    userRoles.includes("volunteer");

  const verifiedDocs = snapshot.documents.filter(
    (doc) => doc.review_status === "verified"
  );
  const pendingDocs = snapshot.documents.filter(
    (doc) => doc.review_status !== "verified"
  );
  const resumeDoc = verifiedDocs[0] ?? snapshot.documents[0] ?? null;

  return (
    <StudentDashboardView
      greetingName={greetingName}
      courses={snapshot.courses}
      documents={snapshot.documents}
      verifiedDocs={verifiedDocs}
      pendingDocs={pendingDocs}
      resumeDoc={resumeDoc}
      canReview={canReview}
    />
  );
}

export default function DashboardPage() {
  return (
    <WorkspaceShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody />
      </Suspense>
    </WorkspaceShell>
  );
}
