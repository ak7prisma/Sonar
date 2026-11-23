import type { Metadata } from "next";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
};

export default function RegisterPage() {
  return (
    <AuthCardLayout
      title="Daftar Akun SONAR"
      description="Bergabung sebagai mahasiswa tunanetra atau volunteer peninjau materi akademik."
    >
      <AuthForm mode="register" />
    </AuthCardLayout>
  );
}
