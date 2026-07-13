"use client";

import dynamic from "next/dynamic";
import { FAB } from "@/components/ds";
import { DantalSidebar } from "./DantalSidebar";
import { useDbStore } from "@/stores/useDbStore";
import { useQuickFlowStore } from "@/stores/useQuickFlowStore";
import type { SessionUser } from "@/types/session";
import { Zap } from "lucide-react";

const QuickFlowModal = dynamic(
  () => import("@/components/quickflow/QuickFlowModal").then((mod) => mod.QuickFlowModal),
  { ssr: false }
);

export function DantalShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const clinicName = useDbStore((s) => s.db.meta.clinicName);
  const qfOpen = useQuickFlowStore((s) => s.open);
  const openBlank = useQuickFlowStore((s) => s.openBlank);
  const closeQf = useQuickFlowStore((s) => s.close);
  const showFab = user.role !== "patient" && user.role !== "secretary";

  return (
    <div className="dantal-app flex min-h-screen w-full bg-background">
      <DantalSidebar user={user} clinicName={clinicName} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden dantal-page-bg">
        <main className="w-full flex-1">{children}</main>
      </div>
      {showFab && (
        <FAB onClick={openBlank} label="Quick Flow">
          <Zap className="h-5 w-5" />
          <span>ابدأ</span>
        </FAB>
      )}
      <QuickFlowModal open={qfOpen} onClose={closeQf} />
    </div>
  );
}
