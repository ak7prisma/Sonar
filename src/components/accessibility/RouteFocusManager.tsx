"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

/**
 * Ensures screen reader and keyboard users receive reliable orientation on
 * App Router client navigations by focusing the new page's primary heading
 * or main landmark and announcing the page title cleanly.
 */
export function RouteFocusManager() {
  const pathname = usePathname();
  const isInitialLoad = useRef(true);
  const { announce } = useLiveAnnouncer();

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const heading = document.querySelector<HTMLElement>("main h1");
      const main = document.getElementById("main-content");
      const target = heading ?? main;

      if (target) {
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: false });
      }

      const pageLabel = heading?.textContent?.trim() || document.title;
      if (pageLabel) {
        announce(`Navigated to ${pageLabel}`);
      }
    }, 60);

    return () => window.clearTimeout(timer);
  }, [pathname, announce]);

  return null;
}
