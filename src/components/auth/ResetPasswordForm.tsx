"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { resetPasswordAction } from "@/features/authentication/actions";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function ResetPasswordForm() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { announce } = useLiveAnnouncer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    async function verifySession() {
      if (!isSupabaseConfigured()) {
        setCheckingSession(false);
        setHasValidSession(true);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setCheckingSession(false);
        setHasValidSession(true);
        return;
      }

      // Check current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setHasValidSession(true);
        setCheckingSession(false);
        return;
      }

      // Check if there is an access_token in the URL hash (legacy implicit recovery flow)
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") ?? "";
        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            setHasValidSession(true);
            setCheckingSession(false);
            return;
          }
        }
      }

      // Also listen for auth state changes (e.g. PASSWORD_RECOVERY event)
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && newSession)) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
        }
      );

      // Give a brief window to confirm or fallback
      const timer = setTimeout(() => {
        setCheckingSession(false);
      }, 1000);

      return () => {
        authListener.subscription.unsubscribe();
        clearTimeout(timer);
      };
    }

    verifySession();
  }, []);

  const onValidSubmit = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    setServerError(null);
    setSuccessMessage(null);

    // Call server action to update password
    const res = await resetPasswordAction(values);

    if (res?.error) {
      setServerError(res.error);
      announce(res.error, "assertive");
    } else {
      setSuccessMessage(
        "Kata sandi baru Anda berhasil disimpan. Mengalihkan ke halaman login..."
      );
      announce("Kata sandi berhasil diperbarui.", "polite");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    }
  };

  const onInvalidSubmit = () => {
    announce(
      "Terdapat kesalahan input pada formulir. Silakan periksa kembali.",
      "assertive"
    );
  };

  if (checkingSession) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-ui">
        Memverifikasi sesi pemulihan kata sandi...
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="space-y-4 font-ui">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Tautan Kedaluwarsa atau Tidak Valid</AlertTitle>
          <AlertDescription>
            Sesi reset kata sandi tidak ditemukan atau telah kedaluwarsa. Silakan ajukan permohonan tautan pemulihan baru melalui halaman Lupa Kata Sandi.
          </AlertDescription>
        </Alert>

        <Button asChild className="w-full h-11 font-semibold" size="lg">
          <Link href="/forgot-password">
            Ajukan Tautan Baru
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Gagal Menyimpan Sandi</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-success/30 bg-success/10 text-success-foreground">
          <CheckCircle2 className="size-4 text-success" />
          <AlertTitle>Berhasil Diperbarui</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form
        noValidate
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        className="space-y-4 font-ui"
      >
        <div className="space-y-1.5">
          <Label htmlFor="field-password">Kata Sandi Baru</Label>
          <PasswordInput
            id="field-password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "error-password password-hint" : "password-hint"
            }
            toggleAriaLabel={{
              show: "Tampilkan kata sandi baru",
              hide: "Sembunyikan kata sandi baru",
            }}
            {...register("password")}
          />
          <p id="password-hint" className="text-xs text-muted-foreground">
            Minimal 8 karakter.
          </p>
          {errors.password?.message && (
            <p id="error-password" className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="field-confirmPassword">Konfirmasi Kata Sandi Baru</Label>
          <PasswordInput
            id="field-confirmPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "error-confirmPassword" : undefined
            }
            toggleAriaLabel={{
              show: "Tampilkan konfirmasi kata sandi",
              hide: "Sembunyikan konfirmasi kata sandi",
            }}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword?.message && (
            <p id="error-confirmPassword" className="text-xs font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold flex items-center justify-center gap-2"
          size="lg"
          disabled={isSubmitting}
        >
          <KeyRound className="size-4" aria-hidden="true" />
          <span>
            {isSubmitting ? "Menyimpan kata sandi..." : "Simpan Kata Sandi Baru"}
          </span>
        </Button>
      </form>
    </div>
  );
}
