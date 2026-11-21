"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { toast } from "sonner";

export function CourseCreateForm({
  isConfigured,
}: {
  isConfigured: boolean;
}) {
  const router = useRouter();
  const { announce } = useLiveAnnouncer();

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("STEM & Engineering");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, title, discipline, description }),
      });

      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        const msg = payload.error ?? "Failed to create course.";
        toast.error(msg);
        announce(msg, "assertive");
        return;
      }

      toast.success(`Course ${code.toUpperCase()} created.`);
      announce(`Course ${title} created.`, "polite");
      setCode("");
      setTitle("");
      setDescription("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="course-code">Course code</Label>
          <Input
            id="course-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MATH-101"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="course-discipline">Academic discipline</Label>
          <Input
            id="course-discipline"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="course-title">Course title</Label>
        <Input
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Calculus & Analytical Geometry"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="course-desc">Description (optional)</Label>
        <Textarea
          id="course-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={!isConfigured || submitting}>
        <PlusCircle className="size-4" aria-hidden="true" />
        <span>{submitting ? "Creating course..." : "Create course"}</span>
      </Button>
    </form>
  );
}
