"use client";

import { useSessionStore } from "@/stores/useSessionStore";
import { EmptyState } from "@/components/ui/EmptyState";

export function OwnerOnly({ children }: { children: React.ReactNode }) {
  const user = useSessionStore((s) => s.user);
  if (!user || user.role !== "owner") {
    return <EmptyState>هذه الصفحة للمالك فقط</EmptyState>;
  }
  return <>{children}</>;
}
