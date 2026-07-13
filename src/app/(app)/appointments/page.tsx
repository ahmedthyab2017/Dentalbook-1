"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarDays, Calendar } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { DantalApptCard } from "@/components/appointments/DantalApptCard";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { Button, EmptyState, Tabs } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import {
  filterAppointments,
  type ApptStatusFilter,
} from "@/lib/appointments-utils";
import { todayStr } from "@/lib/format";
import { slideUp } from "@/lib/motion";
import type { Appointment } from "@/types/db";
import { cn } from "@/lib/cn";

const STATUS_TABS: { id: ApptStatusFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "scheduled", label: "مجدول" },
  { id: "confirmed", label: "مؤكد" },
  { id: "completed", label: "منجز" },
  { id: "cancelled", label: "ملغى" },
];

export default function AppointmentsPage() {
  const db = useDbStore((s) => s.db);
  const updateAppointment = useDbStore((s) => s.updateAppointment);

  const [date, setDate] = useState(todayStr());
  const [upcoming, setUpcoming] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApptStatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | undefined>();

  const list = filterAppointments(db.appointments, { date, upcoming, statusFilter });

  function openEdit(a: Appointment) {
    setEditing(a);
    setModalOpen(true);
  }

  function openNew() {
    setEditing(undefined);
    setModalOpen(true);
  }

  return (
    <DantalPage title="المواعيد">
      <motion.div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h1 className="dantal-title">المواعيد</h1>
          <p className="dantal-subtitle mt-2">
            {upcoming ? "المواعيد القادمة" : `مواعيد ${date}`}
            <span className="mx-2 text-border">·</span>
            <span className="font-semibold text-primary">{list.length}</span> موعد
          </p>
        </div>
        <Button onClick={openNew} size="lg">
          <Plus className="h-4 w-4" />
          موعد جديد
        </Button>
      </motion.div>

      <div className="dantal-toolbar mb-6">
        <Button
          variant={upcoming ? "primary" : "soft"}
          size="sm"
          onClick={() => setUpcoming(!upcoming)}
        >
          <CalendarDays className="h-4 w-4" />
          قادمة
        </Button>
        <div className="relative">
          <Calendar className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="date"
            value={date}
            disabled={upcoming}
            onChange={(e) => {
              setDate(e.target.value);
              setUpcoming(false);
            }}
            className={cn(
              "dantal-focus h-9 rounded-[12px] border border-border bg-surface ps-10 pe-3 text-sm font-medium",
              "text-foreground shadow-[var(--shadow-soft)] disabled:opacity-50"
            )}
          />
        </div>
        <div className="ms-auto overflow-x-auto pb-0.5">
          <Tabs
            tabs={STATUS_TABS}
            active={statusFilter}
            onChange={(id) => setStatusFilter(id as ApptStatusFilter)}
            variant="pill"
            className="min-w-max"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={upcoming ? "لا مواعيد قادمة" : "لا مواعيد في هذا اليوم"}
          description="أضف موعداً جديداً أو غيّر الفلتر"
          action={
            <Button variant="soft" onClick={openNew}>
              <Plus className="h-4 w-4" />
              موعد جديد
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {list.map((a, i) => {
            const pt = db.patients.find((p) => p.id === a.ptId);
            return (
              <motion.div key={a.id} {...slideUp} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <DantalApptCard
                  appointment={a}
                  patientName={pt?.name || "مريض غير معروف"}
                  showDate={upcoming}
                  onComplete={() =>
                    updateAppointment(a.id, { status: "completed", updatedAt: Date.now() })
                  }
                  onCancel={() =>
                    updateAppointment(a.id, { status: "cancelled", updatedAt: Date.now() })
                  }
                  onEdit={() => openEdit(a)}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointment={editing}
      />
    </DantalPage>
  );
}
