"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardBody, Badge, Avatar, EmptyState } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { fmtDateShort, todayStr } from "@/lib/format";
import { Calendar, Users, Clock } from "lucide-react";
import { slideUp } from "@/lib/motion";

const STATUS_VARIANT: Record<string, "default" | "success" | "primary" | "warning" | "danger"> = {
  scheduled: "primary",
  confirmed: "success",
  completed: "default",
  cancelled: "danger",
  "no-show": "warning",
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "منتهي",
  cancelled: "ملغى",
  "no-show": "لم يحضر",
};

export function DantalTodaySchedule() {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const today = todayStr();

  const list = db.appointments
    .filter((a) => a.date === today && a.status !== "cancelled")
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .slice(0, 8);

  return (
    <motion.div {...slideUp}>
      <Card hover>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary-muted">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <CardTitle>جدول اليوم</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 pt-0">
          {list.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="لا مواعيد اليوم"
              description="جدولك فارغ — استمتع بيوم هادئ"
              className="py-10"
            />
          ) : (
            list.map((a) => {
              const pt = db.patients.find((p) => p.id === a.ptId);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => router.push(`/patients/${a.ptId}`)}
                  className="dantal-focus flex w-full items-center gap-4 rounded-[14px] border border-border-subtle p-3 text-start transition-colors hover:bg-border-subtle/60"
                >
                  <span className="w-14 shrink-0 text-sm font-semibold text-primary">{a.time || "--:--"}</span>
                  <Avatar name={pt?.name || "?"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{pt?.name || "مريض"}</div>
                    <div className="truncate text-xs text-muted">{a.note || a.purpose || ""}</div>
                  </div>
                  <Badge variant={STATUS_VARIANT[a.status] || "default"}>{STATUS_LABEL[a.status] || a.status}</Badge>
                </button>
              );
            })
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

export function DantalRecentPatients() {
  const router = useRouter();
  const db = useDbStore((s) => s.db);

  const list = [...db.patients]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 6);

  return (
    <motion.div {...slideUp} transition={{ delay: 0.05 }}>
      <Card hover>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-secondary/15">
            <Users className="h-4 w-4 text-secondary" />
          </div>
          <CardTitle>آخر المرضى</CardTitle>
        </CardHeader>
        <CardBody className="space-y-1 pt-0">
          {list.length === 0 ? (
            <EmptyState icon={Users} title="لا مرضى بعد" className="py-10" />
          ) : (
            list.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push(`/patients/${p.id}`)}
                className="dantal-focus flex w-full items-center gap-3 rounded-[14px] p-3 text-start transition-colors hover:bg-border-subtle/60"
              >
                <Avatar name={p.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted">{p.phone || "—"}</div>
                </div>
                <span className="text-xs text-muted">{fmtDateShort(new Date(p.createdAt).toISOString().slice(0, 10))}</span>
              </button>
            ))
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
