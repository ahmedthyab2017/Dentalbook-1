"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/useSessionStore";
import { isBackendAuthed, pullFromBackend, pushToBackend } from "@/lib/backend";
import { useDbStore } from "@/stores/useDbStore";

const PUSH_DELAY_MS = 1500;

export function useBackendSync() {
  const hasHydrated = useDbStore((s) => s.hasHydrated);
  const user = useSessionStore((s) => s.user);
  const skipPush = useRef(true);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasHydrated || !user || !isBackendAuthed()) return;

    let cancelled = false;

    void (async () => {
      try {
        const cloud = useDbStore.getState().db.meta.cloud;
        const pulled = await pullFromBackend(cloud);
        if (!cancelled && pulled) {
          useDbStore.getState().replaceDb(pulled);
        }
      } catch {
        /* keep local data on pull failure */
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            skipPush.current = false;
          }, 400);
        }
      }
    })();

    const unsub = useDbStore.subscribe((state, prev) => {
      if (skipPush.current || state.db === prev.db) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        void pushToBackend(state.db).catch(() => {
          /* silent — user can retry via settings */
        });
      }, PUSH_DELAY_MS);
    });

    return () => {
      cancelled = true;
      unsub();
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [hasHydrated, user]);
}
