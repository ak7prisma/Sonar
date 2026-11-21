"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckSquare,
  FileUp,
  Home,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const COMMAND_ROUTES = [
  { label: "Home & Live Accessibility Sandbox", href: "/", icon: Home },
  { label: "Student Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/courses", icon: BookOpen },
  { label: "Upload Course PDF", href: "/upload", icon: FileUp },
  { label: "Document Reader", href: "/reader", icon: BookOpen },
  { label: "Volunteer Review Queue", href: "/review", icon: CheckSquare },
  { label: "Accessibility & Account Settings", href: "/settings", icon: Settings },
  { label: "Administration Console", href: "/admin", icon: Shield },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 text-muted-foreground"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="hidden md:inline">Quick jump</span>
        <span className="sr-only md:hidden">Quick jump navigation menu</span>
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground lg:inline">
          Ctrl+K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="SONAR Navigation Menu"
        description="Search and jump directly to any SONAR workspace page."
      >
        <CommandInput placeholder="Jump to page or workspace..." />
        <CommandList>
          <CommandEmpty>No matching destination found.</CommandEmpty>
          <CommandGroup heading="Workspaces">
            {COMMAND_ROUTES.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  <Icon className="mr-2 size-4 text-primary" aria-hidden="true" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
