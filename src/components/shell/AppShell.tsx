"use client";

import { DantalShell } from "@/components/layout/DantalShell";
import type { SessionUser } from "@/types/session";

/** @deprecated Use DantalShell — kept as alias for app layout */
export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return <DantalShell user={user}>{children}</DantalShell>;
}
