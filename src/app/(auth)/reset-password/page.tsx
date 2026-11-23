import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi",
};

export default function ResetPasswordPage() {
  return (
    <AuthCardLayout
      title="Atur Ulang Kata Sandi"
      description="Buat kata sandi baru yang aman untuk akun SONAR Anda."
    >
      <Suspense
        fallback={
          <div className="p-4 text-xs text-muted-foreground font-ui">
            Memuat formulir atur ulang kata sandi...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCardLayout>
  );
}
