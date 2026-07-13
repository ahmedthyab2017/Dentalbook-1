"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { useSessionStore } from "@/stores/useSessionStore";
import { useDbStore } from "@/stores/useDbStore";
import { useIdleLock } from "@/hooks/useIdleLock";
import { useBackendSync } from "@/hooks/useBackendSync";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const hasHydrated = useDbStore((s) => s.hasHydrated);
  const ensureSeeded = useDbStore((s) => s.ensureSeeded);

  useBackendSync();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    if (hasHydrated) ensureSeeded();
  }, [hasHydrated, ensureSeeded]);

  useIdleLock();

  if (!user) return null;

  return <AppShell user={user}>{children}</AppShell>;
}
