"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Cloud } from "@/lib/cloud";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";

// Ported from app/app.js:1854-1889 (IdleLock) — auto-logout after
// db.meta.idleLockMin minutes of inactivity on a shared clinic device.
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export function useIdleLock() {
  const router = useRouter();
  const minutes = useDbStore((s) => s.db.meta.idleLockMin) || 5;
  const logout = useSessionStore((s) => s.logout);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function lock() {
      if (Cloud.loggedIn()) Cloud.logout();
      logout();
      router.replace("/login");
    }
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(lock, minutes * 60 * 1000);
    }
    ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [minutes, logout, router]);
}
