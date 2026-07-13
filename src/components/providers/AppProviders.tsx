"use client";

import { useEffect } from "react";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { applyLangToDocument } from "@/lib/i18n";
import { useCloudAutoSync } from "@/hooks/useCloudAutoSync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const lang = useUiPrefsStore((s) => s.lang);
  const theme = useUiPrefsStore((s) => s.theme);

  useCloudAutoSync();

  useEffect(() => {
    applyLangToDocument(lang, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [lang, theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      void caches.keys().then((keys) => {
        keys.forEach((key) => void caches.delete(key));
      });
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    });
  }, []);

  return (
    <>
      {children}
      <div id="print-area" aria-hidden="true" />
    </>
  );
}
