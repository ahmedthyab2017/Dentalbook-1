"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/useSessionStore";
import { isBackendAuthed, pushToBackend } from "@/lib/backend";
import { useDbStore } from "@/stores/useDbStore";
import type { DentistDb } from "@/types/db";

const PUSH_DELAY_MS = 800;

export function useBackendSync() {
  const hasHydrated = useDbStore((s) => s.hasHydrated);
  const user = useSessionStore((s) => s.user);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDb = useRef<DentistDb>(useDbStore.getState().db);

  useEffect(() => {
    if (!hasHydrated || !user || !isBackendAuthed()) return;

    const flush = () => {
      if (pushTimer.current) {
        clearTimeout(pushTimer.current);
        pushTimer.current = null;
      }
      void pushToBackend(latestDb.current).catch(() => {
        /* silent */
      });
    };

    const schedulePush = (db: DentistDb) => {
      latestDb.current = db;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(flush, PUSH_DELAY_MS);
    };

    const unsub = useDbStore.subscribe((state, prev) => {
      if (state.db === prev.db) return;
      schedulePush(state.db);
    });

    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      unsub();
      flush();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [hasHydrated, user]);
}
