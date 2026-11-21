"use client";

import { Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LiveAnnouncerProvider } from "@/components/accessibility/LiveAnnouncer";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { RouteFocusManager } from "@/components/accessibility/RouteFocusManager";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={300}>
            <LiveAnnouncerProvider>
              <AccessibilityProvider>
                <Suspense fallback={null}>
                  <RouteFocusManager />
                </Suspense>
                {children}
                <Toaster
                  position="bottom-right"
                  richColors
                  closeButton
                  toastOptions={{
                    className: "border border-border bg-card text-card-foreground",
                  }}
                />
              </AccessibilityProvider>
            </LiveAnnouncerProvider>
          </TooltipProvider>
        </MotionConfig>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
