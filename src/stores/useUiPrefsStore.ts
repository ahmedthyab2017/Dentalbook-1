"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang, Theme } from "@/types/session";

// Persisted separately from session (keys mkh_lang/mkh_theme in the legacy
// app) because lang/theme DO survive refresh, unlike the rest of session
// state (app/app.js:1183-1197).
interface UiPrefsStore {
  lang: Lang;
  theme: Theme;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
}

export const useUiPrefsStore = create<UiPrefsStore>()(
  persist(
    (set, get) => ({
      lang: "ar",
      theme: "light",
      setLang: (l) => set({ lang: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      toggleLang: () => set({ lang: get().lang === "ar" ? "en" : "ar" }),
    }),
    { name: "mkh_ui_prefs" }
  )
);
