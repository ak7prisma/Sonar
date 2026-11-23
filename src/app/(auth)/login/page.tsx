import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { AuthForm } from "@/components/auth/AuthForm";

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
      <Suspense
        fallback={
          <div className="p-4 text-xs text-muted-foreground font-ui">
            Memuat formulir masuk...
          </div>
        }
      >
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthCardLayout>
  );
}
