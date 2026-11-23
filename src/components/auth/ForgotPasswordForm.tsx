"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { forgotPasswordAction } from "@/features/authentication/actions";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [summaryFocusNonce, setSummaryFocusNonce] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const { announce } = useLiveAnnouncer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const errorEntries = Object.entries(errors).filter(
    ([, val]) => val && typeof val.message === "string"
  );

  useEffect(() => {
    if (summaryFocusNonce > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [summaryFocusNonce]);

  const onValidSubmit = async (values: { email: string }) => {
    setServerError(null);
    setSuccessMessage(null);

    const res = await forgotPasswordAction({ email: values.email });

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
          aria-labelledby="forgot-error-summary-title"
          className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <h2
            id="forgot-error-summary-title"
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
          <AlertTitle>Permintaan Gagal</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-success/30 bg-success/10 text-success-foreground">
          <CheckCircle2 className="size-4 text-success" />
          <AlertTitle>Email Terkirim</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form
        noValidate
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        className="space-y-4 font-ui"
      >
        <div className="space-y-1.5">
          <Label htmlFor="field-email">Alamat Email Terdaftar</Label>
          <Input
            id="field-email"
            type="email"
            autoComplete="email"
            placeholder="nama@kampus.ac.id"
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

        <Button
          type="submit"
          className="w-full h-11 font-semibold"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Mengirim tautan..." : "Kirim Tautan Pemulihan"}
        </Button>
      </form>

      <div className="pt-2 text-center font-ui">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Kembali ke halaman Masuk</span>
        </Link>
      </div>
    </div>
  );
}
