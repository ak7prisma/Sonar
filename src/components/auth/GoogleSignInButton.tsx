"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogleAction } from "@/features/authentication/actions";
import { mapAuthErrorMessage } from "@/features/authentication/utils";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

interface GoogleSignInButtonProps {
  mode?: "login" | "register";
  redirectTo?: string;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  mode = "login",
  redirectTo = "/dashboard",
  onError,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const { announce } = useLiveAnnouncer();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      announce("Menghubungkan ke akun Google...", "polite");

      // 1. First attempt: Use Server Action so that PKCE verifier cookies are set reliably via HTTP Set-Cookie headers
      const res = await signInWithGoogleAction(redirectTo);
      if (res?.error) {
        // Fallback to client-side OAuth if Server Action returned an explicit error
        const supabase = createClient();
        if (!supabase) {
          onError?.(res.error);
          announce(res.error, "assertive");
          setLoading(false);
          return;
        }

        const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";
        const origin = window.location.origin;
        const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });

        if (error) {
          const errorMsg = mapAuthErrorMessage(error.message);
          onError?.(errorMsg);
          announce(errorMsg, "assertive");
          setLoading(false);
          return;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      // NEXT_REDIRECT is the expected signal thrown by Next.js Server Action redirect()
      if (
        (err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT") ||
        (err instanceof Error && err.message.includes("NEXT_REDIRECT"))
      ) {
        return;
      }

      const fallbackMsg =
        err instanceof Error
          ? err.message
          : "Gagal menghubungkan ke layanan Google.";
      onError?.(fallbackMsg);
      announce(fallbackMsg, "assertive");
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full h-11 font-semibold flex items-center justify-center gap-3 bg-card hover:bg-muted/80 border-border text-foreground transition-colors shadow-xs"
      aria-label={
        loading
          ? "Menghubungkan ke Google..."
          : mode === "register"
            ? "Daftar dengan Google"
            : "Masuk dengan Google"
      }
    >
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>
        {loading
          ? "Menghubungkan ke Google..."
          : mode === "register"
            ? "Daftar dengan Google"
            : "Masuk dengan Google"}
      </span>
    </Button>
  );
}
