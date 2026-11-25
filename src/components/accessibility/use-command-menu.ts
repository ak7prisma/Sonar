"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchCourse, SearchDocument } from "./command-menu.types";

export function useCommandMenu() {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<SearchCourse[]>([]);
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const router = useRouter();

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
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

  // Fetch searchable courses and documents when dialog is opened
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    fetch("/api/search")
      .then((res) => (res.ok ? res.json() : { courses: [], documents: [] }))
      .then((data: { courses?: SearchCourse[]; documents?: SearchDocument[] }) => {
        if (!isMounted) return;
        if (data.courses) setCourses(data.courses);
        if (data.documents) setDocuments(data.documents);
      })
      .catch(() => {
        // Fallback gracefully on network error or offline mode
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleNavigate = useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router]
  );

  return {
    open,
    setOpen,
    courses,
    documents,
    handleNavigate,
  };
}
