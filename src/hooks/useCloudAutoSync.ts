"use client";

import { useEffect, useRef } from "react";
import { Cloud } from "@/lib/cloud";
import { STORAGE_KEY } from "@/types/db";
import { useDbStore } from "@/stores/useDbStore";

const INTERVAL_MS = 5 * 60 * 1000;

export function useCloudAutoSync() {
  const cfg = useDbStore((s) => s.db.meta.cloud);
  const hasHydrated = useDbStore((s) => s.hasHydrated);
  const syncing = useRef(false);

  useEffect(() => {
    if (!hasHydrated || !cfg.autoSync || !Cloud.configured() || !Cloud.loggedIn()) return;
    const pass = cfg.passphrase?.trim();
    if (!pass) return;

    let cancelled = false;

    async function tick() {
      if (syncing.current || cancelled) return;
      syncing.current = true;
      try {
        await Cloud.syncNow(pass);
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) useDbStore.getState().replaceDb(JSON.parse(raw));
      } catch {
        /* silent — user can manual sync from settings */
      } finally {
        syncing.current = false;
      }
    }

    tick();
    const id = setInterval(tick, INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hasHydrated, cfg.autoSync, cfg.passphrase, cfg.apiUrl]);
}
