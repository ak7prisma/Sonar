"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  loginAction,
  loginAsDemoRole,
  registerAction,
} from "@/features/authentication/actions";
import { loginSchema, registerSchema } from "@/lib/validation/schemas";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

interface AuthFormProps {
  mode: "login" | "register";
  redirectTo?: string;
}

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
      {/* Quick Demo Role Sign In */}
      <div className="rounded-2xl border border-primary/20 bg-secondary/50 p-4 space-y-3 font-ui">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Masuk Cepat Demo Peran
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">Uji Coba Langsung</span>
        </div>

        <div className="grid gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => loginAsDemoRole("student", redirectTo)}
            className="flex items-center justify-between p-3 h-auto bg-card hover:bg-muted/80 border-border text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                AF
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">Ahmad Fauzi (Mahasiswa Tunanetra)</p>
                <p className="text-[11px] text-muted-foreground">Akses CS 201, MATH 105 &bull; Audio Reader</p>
              </div>
            </div>
            <span className="text-xs text-primary font-semibold">Pilih &rarr;</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => loginAsDemoRole("volunteer", redirectTo)}
            className="flex items-center justify-between p-3 h-auto bg-card hover:bg-muted/80 border-border text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                DS
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">Dewi Sartika, S.Kom. (Volunteer)</p>
                <p className="text-[11px] text-muted-foreground">Review Queue, Verifikasi OCR &amp; MathML</p>
              </div>
            </div>
            <span className="text-xs text-primary font-semibold">Pilih &rarr;</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => loginAsDemoRole("admin", redirectTo)}
            className="flex items-center justify-between p-3 h-auto bg-card hover:bg-muted/80 border-border text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                HG
              </div>
              <div>
                <p className="font-bold text-xs text-foreground">Dr. Hendra Gunawan (Administrator)</p>
                <p className="text-[11px] text-muted-foreground">Kelola 3 Mata Kuliah, Akun, &amp; Sharing</p>
              </div>
            </div>
            <span className="text-xs text-primary font-semibold">Pilih &rarr;</span>
          </Button>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-border w-full" />
        <span className="bg-background px-3 text-xs text-muted-foreground font-ui uppercase tracking-wider relative">
          atau masuk dengan email
        </span>
      </div>

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
          <AlertTitle>Gagal Masuk</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
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
          <Label htmlFor="field-email">Alamat Email Kampus</Label>
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
          <Label htmlFor="field-password">Kata Sandi</Label>
          <div className="relative flex items-center">
            <Input
              id="field-password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "error-password password-hint" : "password-hint"
              }
              className="pr-11"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              aria-pressed={showPassword}
              className="absolute right-1"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          <p id="password-hint" className="text-xs text-muted-foreground">
            Minimal 8 karakter.
          </p>
          {errors.password?.message && (
            <p id="error-password" className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold" size="lg" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "login"
              ? "Sedang masuk..."
              : "Membuat akun..."
            : mode === "login"
              ? "Masuk ke SONAR"
              : "Daftar Akun Baru"}
        </Button>
      </form>

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
