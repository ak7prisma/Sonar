import type { LucideIcon } from "lucide-react";

export interface SearchCourse {
  id: string;
  code: string;
  title: string;
  discipline: string;
}

export interface SearchDocument {
  id: string;
  title: string;
  courseId: string;
  status: string;
}

export interface CommandRouteItem {
  label: string;
  href: string;
  icon: LucideIcon;
  keywords: string;
}

export interface CommandMenuProps {
  compact?: boolean;
  /** Wide pill-shaped search field used in the workspace header. */
  bar?: boolean;
}
