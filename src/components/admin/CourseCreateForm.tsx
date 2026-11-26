"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { readJsonSafely } from "@/lib/http/safe-json";

export function CourseCreateForm({
  isConfigured,
}: {
  isConfigured: boolean;
}) {
  const router = useRouter();
  const { announce } = useLiveAnnouncer();

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("Ilmu Komputer");
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

      const payload = await readJsonSafely<{ error?: string }>(res);
      if (!res.ok) {
        const msg = payload?.error ?? "Gagal membuat mata kuliah baru.";
        toast.error(msg);
        announce(msg, "assertive");
        return;
      }

      toast.success(`Mata kuliah ${code.toUpperCase()} berhasil ditambahkan.`);
      announce(`Mata kuliah ${title} berhasil ditambahkan.`, "polite");
      setCode("");
      setTitle("");
      setDescription("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-ui">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="course-code">Kode mata kuliah</Label>
          <Input
            id="course-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Contoh: MATH-101"
            className="h-10 rounded-xl"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="course-discipline">Bidang ilmu</Label>
          <Input
            id="course-discipline"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="h-10 rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="course-title">Nama mata kuliah</Label>
        <Input
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Kalkulus dan Geometri Analitik"
          className="h-10 rounded-xl"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="course-desc">Deskripsi singkat (opsional)</Label>
        <Textarea
          id="course-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="font-sans text-sm"
        />
      </div>

      <Button
        type="submit"
        disabled={!isConfigured || submitting}
        className="min-h-10 rounded-full px-5 text-sm font-semibold"
      >
        <PlusCircle className="size-4" aria-hidden="true" />
        <span>{submitting ? "Menambahkan…" : "Tambah Mata Kuliah"}</span>
      </Button>
    </form>
  );
}
