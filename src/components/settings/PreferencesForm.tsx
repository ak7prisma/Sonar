"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  useAccessibilityStore,
  type ReadingFont,
  type ReadingWidth,
} from "@/stores/accessibility-store";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";
import { toast } from "sonner";

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
          toast.error("Could not save preferences to your cloud profile.");
          announce("Error saving preferences to server.", "assertive");
          return;
        }
      }

      toast.success("Accessibility preferences saved.");
      announce("Accessibility preferences saved.", "polite");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Typography */}
      <section aria-labelledby="pref-type-heading" className="space-y-4 rounded-xl border bg-card p-6">
        <h2 id="pref-type-heading" className="font-heading text-lg font-semibold">
          Reading typography &amp; spacing
        </h2>

        <div className="space-y-2">
          <Label htmlFor="settings-font">Preferred reading font</Label>
          <select
            id="settings-font"
            value={store.readingFont}
            onChange={(e) => store.setReadingFont(e.target.value as ReadingFont)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="atkinson">
              Atkinson Hyperlegible (Recommended for low vision)
            </option>
            <option value="lexend">Lexend (Designed for reading fluency)</option>
            <option value="inter">Inter (Clean neutral sans-serif)</option>
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label htmlFor="settings-size">Text size</Label>
              <span className="font-medium tabular-nums">{store.fontSizePx}px</span>
            </div>
            <Slider
              id="settings-size"
              aria-label="Reading text size"
              min={14}
              max={28}
              step={1}
              value={[store.fontSizePx]}
              onValueChange={([val]) => store.setFontSizePx(val)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label htmlFor="settings-line-height">Line height</Label>
              <span className="font-medium tabular-nums">{store.lineHeight}×</span>
            </div>
            <Slider
              id="settings-line-height"
              aria-label="Line spacing multiplier"
              min={1.4}
              max={2.4}
              step={0.05}
              value={[store.lineHeight]}
              onValueChange={([val]) => store.setLineHeight(val)}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-width">Column width</Label>
            <select
              id="settings-width"
              value={store.readingWidth}
              onChange={(e) => store.setReadingWidth(e.target.value as ReadingWidth)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="narrow">Narrow (56ch)</option>
              <option value="comfortable">Balanced (68ch)</option>
              <option value="wide">Wide (82ch)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-language">Default narration language</Label>
            <select
              id="settings-language"
              value={store.language}
              onChange={(e) =>
                store.setLanguage(e.target.value === "id" ? "id" : "en")
              }
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="en">English (en-US)</option>
              <option value="id">Indonesian / Bahasa Indonesia (id-ID)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contrast, Audio & Motion */}
      <section aria-labelledby="pref-audio-heading" className="space-y-4 rounded-xl border bg-card p-6">
        <h2 id="pref-audio-heading" className="font-heading text-lg font-semibold">
          Visual contrast, speech speed &amp; motion
        </h2>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label htmlFor="settings-speed">Text-to-speech playback rate</Label>
            <span className="font-medium tabular-nums">
              {store.narrationSpeed}×
            </span>
          </div>
          <Slider
            id="settings-speed"
            aria-label="Audio narration speed"
            min={0.5}
            max={2.5}
            step={0.1}
            value={[store.narrationSpeed]}
            onValueChange={([val]) => store.setNarrationSpeed(val)}
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="settings-high-contrast">High contrast theme</Label>
              <p className="text-xs text-muted-foreground">
                Enforces maximum foreground contrast and heavier borders.
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

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="settings-warm-surface">Warm paper background</Label>
              <p className="text-xs text-muted-foreground">
                Reduces glare in light mode for dyslexia and visual fatigue.
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

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="settings-reduced-motion">Reduce motion</Label>
              <p className="text-xs text-muted-foreground">
                Disables UI transitions regardless of operating system settings.
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
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            store.resetDefaults();
            announce("Accessibility preferences reset to defaults.");
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          <span>Reset defaults</span>
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          <span>{saving ? "Saving..." : "Save preferences"}</span>
        </Button>
      </div>
    </form>
  );
}
