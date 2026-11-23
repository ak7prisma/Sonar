"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  loginAction,
  registerAction,
} from "@/features/authentication/actions";
import { loginSchema, registerSchema } from "@/lib/validation/schemas";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PasswordInput } from "@/components/auth/PasswordInput";

interface AuthFormProps {
  mode: "login" | "register";
  redirectTo?: string;
  initialError?: string;
  resetSuccess?: boolean;
}

export function AuthForm({
  mode,
  redirectTo,
  initialError,
  resetSuccess,
}: AuthFormProps) {
  const [serverError, setServerError] = useState<string | null>(initialError ?? null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    resetSuccess ? "Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru." : null
  );
  const [summaryFocusNonce, setSummaryFocusNonce] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const { announce } = useLiveAnnouncer();

  const schema = mode === "login" ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{
    email: string;
    password: string;
    fullName?: string;
    studyProgram?: string;
  }>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      studyProgram: "",
    },
  });

  const errorEntries = Object.entries(errors).filter(
    ([, val]) => val && typeof val.message === "string"
  );

  useEffect(() => {
    if (summaryFocusNonce > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [summaryFocusNonce]);

  useEffect(() => {
    if (initialError) {
      announce(initialError, "assertive");
    }
    if (resetSuccess) {
      announce("Kata sandi berhasil diperbarui. Silakan masuk.", "polite");
    }
  }, [initialError, resetSuccess, announce]);

  const onValidSubmit = async (values: {
    email: string;
    password: string;
    fullName?: string;
    studyProgram?: string;
  }) => {
    setServerError(null);
    setSuccessMessage(null);

    const res =
      mode === "login"
        ? await loginAction({
            email: values.email,
            password: values.password,
            redirectTo,
          })
        : await registerAction({
            email: values.email,
            password: values.password,
            fullName: values.fullName ?? "",
            studyProgram: values.studyProgram,
          });

    if (res?.error) {
      setServerError(res.error);
      announce(res.error, "assertive");
      setSummaryFocusNonce((n) => n + 1);
    } else if (res?.message) {
      setSuccessMessage(res.message);
      announce(res.message, "polite");
    }
  };

  const onInvalidSubmit = () => {
    announce(
      "Terdapat kesalahan input pada formulir. Silakan periksa kembali.",
      "assertive"
    );
    setSummaryFocusNonce((n) => n + 1);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Accessible Error Summary */}
      {errorEntries.length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <h2
            id="error-summary-title"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>Terdapat {errorEntries.length} kesalahan pada formulir</span>
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            {errorEntries.map(([field, err]) => (
              <li key={field}>
                <a
                  href={`#field-${field}`}
                  className="underline hover:text-foreground focus-visible:outline-2"
                >
                  {err?.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Gagal {mode === "login" ? "Masuk" : "Mendaftar"}</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-success/30 bg-success/10 text-success-foreground">
          <CheckCircle2 className="size-4 text-success" />
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form
        noValidate
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        className="space-y-4 font-ui"
      >
        {mode === "register" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="field-fullName">Nama Lengkap</Label>
              <Input
                id="field-fullName"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "error-fullName" : undefined}
                {...register("fullName")}
              />
              {errors.fullName?.message && (
                <p id="error-fullName" className="text-xs font-medium text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field-studyProgram">Program Studi / Peran</Label>
              <Input
                id="field-studyProgram"
                type="text"
                placeholder="Contoh: S1 Ilmu Komputer / Volunteer"
                {...register("studyProgram")}
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="field-email">Alamat Email Kampus / Pribadi</Label>
          <Input
            id="field-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "error-email" : undefined}
            {...register("email")}
          />
          {errors.email?.message && (
            <p id="error-email" className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="field-password">Kata Sandi</Label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Lupa kata sandi?
              </Link>
            )}
          </div>
          <PasswordInput
            id="field-password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "error-password password-hint" : "password-hint"
            }
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

        <Button
          type="submit"
          className="w-full h-11 font-semibold shadow-xs"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === "login"
              ? "Sedang masuk..."
              : "Membuat akun..."
            : mode === "login"
              ? "Masuk ke SONAR"
              : "Daftar Akun Baru"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center font-ui">
        <div className="grow border-t border-border" />
        <span className="shrink-0 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          atau {mode === "login" ? "masuk dengan" : "daftar dengan"}
        </span>
        <div className="grow border-t border-border" />
      </div>

      {/* Google OAuth Button below Email Form */}
      <div className="font-ui">
        <GoogleSignInButton
          mode={mode}
          redirectTo={redirectTo}
          onError={(err) => {
            setServerError(err);
            announce(err, "assertive");
            setSummaryFocusNonce((n) => n + 1);
          }}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground font-ui">
        {mode === "login" ? (
          <>
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Daftar di sini
            </Link>
          </>
        ) : (
          <>
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Masuk di sini
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
