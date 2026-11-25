"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/app/Panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <div
          className={cn(
            "rounded-2xl border border-border p-5 transition-colors",
            store.readingSurface === "warm"
              ? "bg-[#faf6ee] text-[#1c1d1b] dark:bg-[#1a1916] dark:text-[#f4ede0]"
              : "bg-background text-foreground"
          )}
        >
          <div
            className={cn(
              "w-full transition-all",
              store.readingWidth === "narrow"
                ? "max-w-md"
                : store.readingWidth === "wide"
                  ? "max-w-3xl"
                  : "max-w-xl",
              store.readingFont === "lexend"
                ? "font-heading"
                : store.readingFont === "inter"
                  ? "font-sans"
                  : "font-sans"
            )}
            style={{
              fontSize: `${store.fontSizePx}px`,
              lineHeight: store.lineHeight,
              letterSpacing: `${store.letterSpacingEm}em`,
            }}
          >
            <p>
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
            <Select
              value={store.readingFont}
              onValueChange={(val) => store.setReadingFont(val as ReadingFont)}
            >
              <SelectTrigger
                id="settings-font"
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs"
              >
                <SelectValue placeholder="Pilih jenis huruf" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-border bg-popover shadow-md">
                <SelectItem value="atkinson" className="rounded-lg text-sm cursor-pointer">
                  Atkinson Hyperlegible (Direkomendasikan untuk low vision)
                </SelectItem>
                <SelectItem value="lexend" className="rounded-lg text-sm cursor-pointer">
                  Lexend (Dirancang untuk kelancaran membaca)
                </SelectItem>
                <SelectItem value="inter" className="rounded-lg text-sm cursor-pointer">
                  Inter (Sans-serif netral)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
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

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="settings-letter-spacing">Jarak antar huruf</Label>
                <span className="font-semibold tabular-nums">
                  {store.letterSpacingEm} em
                </span>
              </div>
              <Slider
                id="settings-letter-spacing"
                aria-label="Jarak spasi antar huruf dalam em"
                min={0}
                max={0.12}
                step={0.01}
                value={[store.letterSpacingEm]}
                onValueChange={([val]) => store.setLetterSpacingEm(val)}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="settings-width">Lebar kolom bacaan</Label>
              <Select
                value={store.readingWidth}
                onValueChange={(val) =>
                  store.setReadingWidth(val as ReadingWidth)
                }
              >
                <SelectTrigger
                  id="settings-width"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs"
                >
                  <SelectValue placeholder="Pilih lebar kolom" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border bg-popover shadow-md">
                  <SelectItem value="narrow" className="rounded-lg text-sm cursor-pointer">
                    Sempit (56 karakter)
                  </SelectItem>
                  <SelectItem value="comfortable" className="rounded-lg text-sm cursor-pointer">
                    Seimbang (68 karakter)
                  </SelectItem>
                  <SelectItem value="wide" className="rounded-lg text-sm cursor-pointer">
                    Lebar (82 karakter)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="settings-language">Bahasa bawaan narasi suara</Label>
              <Select
                value={store.language}
                onValueChange={(val) =>
                  store.setLanguage(val === "id" ? "id" : "en")
                }
              >
                <SelectTrigger
                  id="settings-language"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-xs"
                >
                  <SelectValue placeholder="Pilih bahasa" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-border bg-popover shadow-md">
                  <SelectItem value="id" className="rounded-lg text-sm cursor-pointer">
                    Bahasa Indonesia (id-ID)
                  </SelectItem>
                  <SelectItem value="en" className="rounded-lg text-sm cursor-pointer">
                    English (en-US)
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex max-w-2xl items-center justify-between gap-4">
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

            <div className="flex max-w-2xl items-center justify-between gap-4">
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

            <div className="flex max-w-2xl items-center justify-between gap-4">
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

      {/* Action buttons — grouped on the left */}
      <div className="flex flex-wrap items-center justify-start gap-3 font-ui">
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
      </div>
    </form>
  );
}
