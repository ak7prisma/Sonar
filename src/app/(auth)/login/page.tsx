import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthFormSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Masuk ke Akun",
};

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; reset?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthForm
      mode="login"
      redirectTo={params.redirectTo}
      initialError={params.error}
      resetSuccess={params.reset === "success"}
    />
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; reset?: string }>;
}) {
  return (
    <AuthCardLayout
      title="Masuk ke SONAR"
      description="Akses materi perkuliahan, audio reader sinkron, dan ruang review volunteer."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthCardLayout>
  );
}
