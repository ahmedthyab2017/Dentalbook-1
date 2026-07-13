"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { Badge, Card, CardBody, EmptyState, Tabs } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { treatmentLabel } from "@/lib/treatment-types";
import { fmtMoney } from "@/lib/format";
import { slideUp } from "@/lib/motion";
import type { PlanStatus } from "@/types/db";

type PlanFilter = "all" | PlanStatus;

const FILTERS: { id: PlanFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "active", label: "نشطة" },
  { id: "completed", label: "مكتملة" },
  { id: "cancelled", label: "ملغاة" },
];

const STATUS_LABEL: Record<PlanStatus, string> = {
  active: "نشطة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const STATUS_VARIANT: Record<PlanStatus, "primary" | "success" | "danger"> = {
  active: "primary",
  completed: "success",
  cancelled: "danger",
};

export default function PlansPage() {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const [filter, setFilter] = useState<PlanFilter>("all");

  let list = [...db.plans];
  if (filter !== "all") list = list.filter((p) => p.status === filter);
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  list = list.slice(0, 100);

  return (
    <DantalPage title="خطط العلاج">
      <motion.div className="mb-8" {...slideUp}>
        <h1 className="dantal-title">خطط العلاج</h1>
        <p className="dantal-subtitle mt-2">متابعة خطط العلاج النشطة والمكتملة</p>
      </motion.div>

      <div className="mb-6 overflow-x-auto pb-1">
        <Tabs
          tabs={FILTERS.map((f) => ({ id: f.id, label: f.label }))}
          active={filter}
          onChange={(id) => setFilter(id as PlanFilter)}
          className="min-w-max"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="لا توجد خطط" description="ستظهر خطط العلاج هنا بعد إنشائها" />
      ) : (
        <div className="grid gap-4">
          {list.map((p) => {
            const pt = db.patients.find((x) => x.id === p.ptId);
            const completed = p.sessions.filter((s) => s.done || s.completed).length;
            const total = p.sessions.length || 1;
            const pct = Math.round((completed / total) * 100);
            const tooth = p.tooth || (p.teeth || []).join(", ");

            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                className="cursor-pointer rounded-[var(--radius-card)] outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => router.push(`/patients/${p.ptId}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") router.push(`/patients/${p.ptId}`);
                }}
              >
                <Card hover>
                <CardBody>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{treatmentLabel(p.type)}</p>
                      <p className="mt-1 text-sm text-muted">{pt?.name || "—"}</p>
                      {tooth && <p className="mt-1 text-sm text-muted">🦷 {tooth}</p>}
                    </div>
                    <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-border-subtle">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {completed}/{total} جلسات • {fmtMoney(p.totalCost)}
                    </p>
                  </div>
                </CardBody>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </DantalPage>
  );
}
