"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AppSettings, OcrEngine, BeverageType } from "@/types";

const DEFAULT_SETTINGS: AppSettings = {
  ocrEngine: "openai",
  openaiApiKey: "",
  openaiModel: "gpt-4o",
  defaultBeverageType: "spirits",
  theme: "light",
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  setOcrEngine: (engine: OcrEngine) => void;
  setOpenaiApiKey: (key: string) => void;
  setDefaultBeverageType: (type: BeverageType) => void;
  getEffectiveApiKey: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ttb-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // ignore
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("ttb-settings", JSON.stringify(settings));
    }
  }, [settings, isHydrated]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const setOcrEngine = useCallback((engine: OcrEngine) => {
    setSettings((prev) => ({ ...prev, ocrEngine: engine }));
  }, []);

  const setOpenaiApiKey = useCallback((key: string) => {
    setSettings((prev) => ({ ...prev, openaiApiKey: key }));
  }, []);

  const setDefaultBeverageType = useCallback((type: BeverageType) => {
    setSettings((prev) => ({ ...prev, defaultBeverageType: type }));
  }, []);

  /** Returns the API key: UI setting takes priority, then env var */
  const getEffectiveApiKey = useCallback(() => {
    if (settings.openaiApiKey) return settings.openaiApiKey;
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
  }, [settings.openaiApiKey]);

  if (!isHydrated) return null;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        setOcrEngine,
        setOpenaiApiKey,
        setDefaultBeverageType,
        getEffectiveApiKey,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
