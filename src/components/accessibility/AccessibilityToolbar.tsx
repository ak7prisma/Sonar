"use client";

import { RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  useAccessibilityStore,
  type ReadingFont,
  type ReadingWidth,
} from "@/stores/accessibility-store";
import { useLiveAnnouncer } from "@/components/accessibility/LiveAnnouncer";

export function AccessibilityToolbar({ compact = false }: { compact?: boolean }) {
  const store = useAccessibilityStore();
  const { announce } = useLiveAnnouncer();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={compact ? "ghost" : "outline"}
          size={compact ? "icon" : "sm"}
          aria-label="Reading display and accessibility preferences"
          className={compact ? "text-muted-foreground hover:text-foreground" : undefined}
        >
          <Type className="size-4" aria-hidden="true" />
          {compact ? null : <span className="hidden sm:inline">Reading display</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 space-y-4 p-4"
        aria-label="Reading preferences controls"
      >
        <div className="flex items-center justify-between">
          <p className="font-heading text-sm font-semibold">
            Reading preferences
          </p>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              store.resetDefaults();
              announce("Reading preferences reset to defaults.");
            }}
          >
            <RotateCcw className="mr-1 size-3.5" aria-hidden="true" />
            Reset
          </Button>
        </div>

        {/* Font Choice */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted-foreground">
            Reading typeface
          </legend>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "atkinson", label: "Atkinson" },
                { id: "inter", label: "Inter" },
                { id: "lexend", label: "Lexend" },
              ] as Array<{ id: ReadingFont; label: string }>
            ).map((font) => (
              <Button
                key={font.id}
                size="xs"
                variant={store.readingFont === font.id ? "default" : "outline"}
                aria-pressed={store.readingFont === font.id}
                onClick={() => {
                  store.setReadingFont(font.id);
                  announce(`Reading font set to ${font.label}.`);
                }}
              >
                {font.label}
              </Button>
            ))}
          </div>
        </fieldset>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label htmlFor="pref-font-size">Text size</Label>
            <span className="font-medium tabular-nums">{store.fontSizePx}px</span>
          </div>
          <Slider
            id="pref-font-size"
            aria-label="Reading text size in pixels"
            min={14}
            max={26}
            step={1}
            value={[store.fontSizePx]}
            onValueChange={([val]) => store.setFontSizePx(val)}
          />
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label htmlFor="pref-line-height">Line spacing</Label>
            <span className="font-medium tabular-nums">{store.lineHeight}×</span>
          </div>
          <Slider
            id="pref-line-height"
            aria-label="Reading line spacing multiplier"
            min={1.4}
            max={2.2}
            step={0.05}
            value={[store.lineHeight]}
            onValueChange={([val]) => store.setLineHeight(val)}
          />
        </div>

        {/* Reading Width */}
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted-foreground">
            Column width
          </legend>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "narrow", label: "Narrow" },
                { id: "comfortable", label: "Balanced" },
                { id: "wide", label: "Wide" },
              ] as Array<{ id: ReadingWidth; label: string }>
            ).map((width) => (
              <Button
                key={width.id}
                size="xs"
                variant={store.readingWidth === width.id ? "default" : "outline"}
                aria-pressed={store.readingWidth === width.id}
                onClick={() => store.setReadingWidth(width.id)}
              >
                {width.label}
              </Button>
            ))}
          </div>
        </fieldset>

        {/* Toggles */}
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="pref-high-contrast" className="text-xs">
              High contrast mode
            </Label>
            <Switch
              id="pref-high-contrast"
              checked={store.contrastMode === "high"}
              onCheckedChange={(checked) => {
                store.setContrastMode(checked ? "high" : "standard");
                announce(
                  checked
                    ? "High contrast mode enabled."
                    : "Standard contrast mode restored."
                );
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="pref-warm-surface" className="text-xs">
              Warm dyslexia surface
            </Label>
            <Switch
              id="pref-warm-surface"
              checked={store.readingSurface === "warm"}
              onCheckedChange={(checked) =>
                store.setReadingSurface(checked ? "warm" : "default")
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="pref-reduced-motion" className="text-xs">
              Reduce motion
            </Label>
            <Switch
              id="pref-reduced-motion"
              checked={store.motionPreference === "reduce"}
              onCheckedChange={(checked) =>
                store.setMotionPreference(checked ? "reduce" : "system")
              }
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
