"use client";

import { useState } from "react";
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
  const { announce } = useLiveAnnouncer();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onValidSubmit = async (values: { email: string }) => {
    setServerError(null);
    setSuccessMessage(null);

    const res = await forgotPasswordAction({ email: values.email });

    if (res?.error) {
      setServerError(res.error);
      announce(res.error, "assertive");
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
  };

  return (
    <div className="w-full max-w-md space-y-6">
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
