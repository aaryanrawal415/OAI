import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../auth/AuthProvider";
import { readJson, writeJson } from "../lib/storage";

const KEY = "of_branding";

export interface BrandingSettings {
  organizationName: string;
  tagline: string;
  brandColor: string;
  logoDataUrl: string | null;
  surfaceColor: string;
  inkColor: string;
  backgroundColor: string;
  radius: number;
  radiusLarge: number;
  headerHeight: number;
  cardPadding: number;
  fontScale: number;
  compact: boolean;
  density: "comfortable" | "compact";
  headerStyle: "brand" | "minimal" | "manifest";
}

const DEFAULTS: BrandingSettings = {
  organizationName: "OptiFreight AI",
  tagline: "backhaul matching",
  brandColor: "",
  logoDataUrl: null,
  surfaceColor: "",
  inkColor: "",
  backgroundColor: "",
  radius: 6,
  radiusLarge: 10,
  headerHeight: 56,
  cardPadding: 16,
  fontScale: 100,
  compact: false,
  density: "comfortable",
  headerStyle: "brand",
};

interface BrandingValue {
  settings: BrandingSettings;
  save: (settings: BrandingSettings) => void;
  reset: () => void;
}

const BrandingContext = createContext<BrandingValue | null>(null);

function foregroundFor(hex: string): string {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3 || channels.some((channel) => !Number.isFinite(channel))) return "#ffffff";
  const luminance = channels
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.42 ? "#14213d" : "#ffffff";
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `${KEY}_${user?.id ?? "guest"}`;
  const [settings, setSettings] = useState<BrandingSettings>(() => ({
    ...DEFAULTS,
    ...readJson<Partial<BrandingSettings>>(key, {}),
  }));

  useEffect(() => {
    setSettings({ ...DEFAULTS, ...readJson<Partial<BrandingSettings>>(key, {}) });
  }, [key]);

  useEffect(() => {
    if (settings.brandColor) {
      document.documentElement.style.setProperty("--accent", settings.brandColor);
      document.documentElement.style.setProperty("--accent-ink", foregroundFor(settings.brandColor));
    } else {
      document.documentElement.style.removeProperty("--accent");
      document.documentElement.style.removeProperty("--accent-ink");
    }
    const cssValues: Record<string, string | null> = {
      "--surface": settings.surfaceColor || null,
      "--ink": settings.inkColor || null,
      "--bg": settings.backgroundColor || null,
      "--radius": `${settings.radius}px`,
      "--radius-lg": `${settings.radiusLarge}px`,
      "--header-h": `${settings.headerHeight}px`,
      "--space-4": `${settings.cardPadding}px`,
      "--ui-scale": `${settings.fontScale}%`,
    };
    for (const [property, value] of Object.entries(cssValues)) {
      if (value) document.documentElement.style.setProperty(property, value);
      else document.documentElement.style.removeProperty(property);
    }
    document.documentElement.dataset.density = settings.density;
    document.documentElement.dataset.headerStyle = settings.headerStyle;
    document.documentElement.style.fontSize = settings.fontScale === 100 ? "" : `${settings.fontScale}%`;
  }, [settings]);

  const save = useCallback((next: BrandingSettings) => {
    setSettings(next);
    writeJson(key, next);
  }, [key]);

  const reset = useCallback(() => {
    setSettings(DEFAULTS);
    writeJson(key, DEFAULTS);
  }, [key]);

  const value = useMemo(() => ({ settings, save, reset }), [settings, save, reset]);
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding(): BrandingValue {
  const value = useContext(BrandingContext);
  if (!value) throw new Error("useBranding must be used inside BrandingProvider");
  return value;
}
