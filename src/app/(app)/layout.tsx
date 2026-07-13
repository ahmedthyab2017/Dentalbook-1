"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { useSessionStore } from "@/stores/useSessionStore";
import { useDbStore } from "@/stores/useDbStore";
import { useIdleLock } from "@/hooks/useIdleLock";
import { useBackendSync } from "@/hooks/useBackendSync";
import { isBackendAuthed } from "@/lib/backend";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const sessionHydrated = useSessionStore((s) => s.hasHydrated);
  const hasHydrated = useDbStore((s) => s.hasHydrated);
  const ensureSeeded = useDbStore((s) => s.ensureSeeded);

  useBackendSync();

  useEffect(() => {
    if (!sessionHydrated) return;
    if (!user) router.replace("/login");
  }, [user, sessionHydrated, router]);

  useEffect(() => {
    if (hasHydrated && !isBackendAuthed()) ensureSeeded();
  }, [hasHydrated, ensureSeeded]);

  useIdleLock();

  if (!sessionHydrated || !user) return null;

  return <AppShell user={user}>{children}</AppShell>;
}
