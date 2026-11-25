import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthFormSkeleton } from "@/components/skeletons/PageSkeletons";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi",
};

export default function ResetPasswordPage() {
  return (
    <AuthCardLayout
      title="Atur Ulang Kata Sandi"
      description="Buat kata sandi baru yang aman untuk akun SONAR Anda."
    >
      <Suspense fallback={<AuthFormSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCardLayout>
  );
}
