"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/app/Panel";
import {
  useAccessibilityStore,
  type ReadingFont,
  type ReadingWidth,
} from "@/stores/accessibility-store";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

export function PreferencesForm({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const store = useAccessibilityStore();
  const { announce } = useLiveAnnouncer();
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isAuthenticated) {
        const res = await fetch("/api/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            readingFont: store.readingFont,
            fontSizePx: store.fontSizePx,
            lineHeight: store.lineHeight,
            letterSpacingEm: store.letterSpacingEm,
            readingWidth: store.readingWidth,
            contrastMode: store.contrastMode,
            readingSurface: store.readingSurface,
            narrationSpeed: store.narrationSpeed,
            motionPreference: store.motionPreference,
            language: store.language,
          }),
        });
        if (!res.ok) {
          toast.error("Gagal menyimpan pengaturan ke profil akun.");
          announce("Gagal menyimpan pengaturan ke server.", "assertive");
          return;
        }
      }

      toast.success("Pengaturan aksesibilitas tersimpan.");
      announce("Pengaturan aksesibilitas berhasil disimpan.", "polite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      {/* Live Preview Panel */}
      <Panel
        id="pref-preview"
        title="Pratinjau Teks Pembaca"
        description="Contoh tampilan paragraf pada halaman pembaca menggunakan pengaturan Anda saat ini."
      >
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="sonar-reader-prose mx-auto">
            <p className="text-foreground">
              Setiap materi kuliah yang telah disetujui volunteer memiliki struktur judul berurutan, tabel berlabel jelas, dan narasi rumus matematika sehingga dapat ditelusuri mandiri menggunakan keyboard atau pembaca layar.
            </p>
          </div>
        </div>
      </Panel>

      {/* Typography & Spacing */}
      <Panel id="pref-typography" title="Tipografi & Tata Letak Bacaan">
        <div className="space-y-5 font-ui">
          <div className="space-y-1.5">
            <Label htmlFor="settings-font">Jenis huruf pembaca</Label>
            <select
              id="settings-font"
              value={store.readingFont}
              onChange={(e) => store.setReadingFont(e.target.value as ReadingFont)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="atkinson">
                Atkinson Hyperlegible (Direkomendasikan untuk low vision)
              </option>
              <option value="lexend">
                Lexend (Dirancang untuk kelancaran membaca)
              </option>
              <option value="inter">Inter (Sans-serif netral)</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="settings-size">Ukuran huruf</Label>
                <span className="font-semibold tabular-nums">
                  {store.fontSizePx} px
                </span>
              </div>
              <Slider
                id="settings-size"
                aria-label="Ukuran huruf pembaca dalam piksel"
                min={14}
                max={28}
                step={1}
                value={[store.fontSizePx]}
                onValueChange={([val]) => store.setFontSizePx(val)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="settings-line-height">Jarak antar baris</Label>
                <span className="font-semibold tabular-nums">
                  {store.lineHeight}×
                </span>
              </div>
              <Slider
                id="settings-line-height"
                aria-label="Pengali jarak baris bacaan"
                min={1.4}
                max={2.4}
                step={0.05}
                value={[store.lineHeight]}
                onValueChange={([val]) => store.setLineHeight(val)}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="settings-width">Lebar kolom bacaan</Label>
              <select
                id="settings-width"
                value={store.readingWidth}
                onChange={(e) =>
                  store.setReadingWidth(e.target.value as ReadingWidth)
                }
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="narrow">Sempit (56 karakter)</option>
                <option value="comfortable">Seimbang (68 karakter)</option>
                <option value="wide">Lebar (82 karakter)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-language">Bahasa bawaan narasi suara</Label>
              <select
                id="settings-language"
                value={store.language}
                onChange={(e) =>
                  store.setLanguage(e.target.value === "id" ? "id" : "en")
                }
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="id">Bahasa Indonesia (id-ID)</option>
                <option value="en">English (en-US)</option>
              </select>
            </div>
          </div>
        </div>
      </Panel>

      {/* Contrast, Audio & Motion */}
      <Panel id="pref-audio" title="Kontras Visual, Suara & Gerakan">
        <div className="space-y-5 font-ui">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="settings-speed">Kecepatan pemutaran suara</Label>
              <span className="font-semibold tabular-nums">
                {store.narrationSpeed}×
              </span>
            </div>
            <Slider
              id="settings-speed"
              aria-label="Kecepatan pemutaran text-to-speech"
              min={0.5}
              max={2.5}
              step={0.1}
              value={[store.narrationSpeed]}
              onValueChange={([val]) => store.setNarrationSpeed(val)}
            />
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="settings-high-contrast">Mode kontras tinggi</Label>
                <p className="font-sans text-xs text-muted-foreground">
                  Mempertegas kontras teks, batas panel, dan fokus keyboard.
                </p>
              </div>
              <Switch
                id="settings-high-contrast"
                checked={store.contrastMode === "high"}
                onCheckedChange={(checked) =>
                  store.setContrastMode(checked ? "high" : "standard")
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="settings-warm-surface">Latar kertas hangat</Label>
                <p className="font-sans text-xs text-muted-foreground">
                  Mengurangi silau di mode terang untuk membantu kenyamanan disleksia.
                </p>
              </div>
              <Switch
                id="settings-warm-surface"
                checked={store.readingSurface === "warm"}
                onCheckedChange={(checked) =>
                  store.setReadingSurface(checked ? "warm" : "default")
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="settings-reduced-motion">Kurangi animasi</Label>
                <p className="font-sans text-xs text-muted-foreground">
                  Menonaktifkan transisi antarmuka tanpa bergantung pada pengaturan sistem.
                </p>
              </div>
              <Switch
                id="settings-reduced-motion"
                checked={store.motionPreference === "reduce"}
                onCheckedChange={(checked) =>
                  store.setMotionPreference(checked ? "reduce" : "system")
                }
              />
            </div>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3 font-ui">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            store.resetDefaults();
            announce("Pengaturan aksesibilitas dikembalikan ke bawaan.", "polite");
          }}
          className="min-h-11 rounded-full px-5"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          <span>Kembalikan Bawaan</span>
        </Button>

        <Button
          type="submit"
          disabled={saving}
          className="min-h-11 rounded-full px-6 font-semibold"
        >
          {saving ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          <span>{saving ? "Menyimpan…" : "Simpan Pengaturan"}</span>
        </Button>
      </div>
    </form>
  );
}
