import type { Metadata } from "next";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCardLayout
      title="Lupa Kata Sandi"
      description="Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi."
    >
      <ForgotPasswordForm />
    </AuthCardLayout>
  );
}
