"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { announce } = useLiveAnnouncer();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const selectTheme = (nextTheme: "light" | "dark" | "system", label: string) => {
    setTheme(nextTheme);
    announce(`Theme changed to ${label}.`);
  };

  const activeThemeLabel = mounted ? (theme ?? "system") : "system";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Color theme (${activeThemeLabel})`}
        >
          <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" aria-hidden="true" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" aria-hidden="true" />
          <span className="sr-only">Toggle color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => selectTheme("light", "Light mode")}>
          <Sun className="mr-2 size-4" aria-hidden="true" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTheme("dark", "Dark mode")}>
          <Moon className="mr-2 size-4" aria-hidden="true" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectTheme("system", "System preference")}>
          <Monitor className="mr-2 size-4" aria-hidden="true" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
