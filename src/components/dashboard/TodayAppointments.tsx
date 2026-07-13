"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDbStore } from "@/stores/useDbStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { FinishApptModal } from "@/components/appointments/FinishApptModal";
import { todayStr } from "@/lib/format";
import { L } from "@/lib/i18n";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import type { AppointmentStatus } from "@/types/db";

// Ported from render_dashboard() today's-appointments section (app/app.js:2397-2423).
const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: "badge-info",
  confirmed: "badge-success",
  completed: "badge-success",
  cancelled: "badge-error",
  "no-show": "badge-warn",
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "منتهي",
  cancelled: "ملغى",
  "no-show": "لم يحضر",
};

export function TodayAppointments() {
  const router = useRouter();
  const lang = useUiPrefsStore((s) => s.lang);
  const db = useDbStore((s) => s.db);
  const updateAppointment = useDbStore((s) => s.updateAppointment);
  const [finishId, setFinishId] = useState<string | null>(null);
  const today = todayStr();

  const list = db.appointments
    .filter((a) => a.date === today && a.status !== "cancelled")
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .slice(0, 8);

  if (list.length === 0) {
    return <EmptyState>لا توجد مواعيد اليوم</EmptyState>;
  }

  return (
    <>
      {list.map((a) => {
        const pt = db.patients.find((p) => p.id === a.ptId);
        const isDone = a.status === "completed";
        return (
          <div
            className="appt-card"
            key={a.id}
            onClick={() => router.push(`/patients/${a.ptId}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="appt-time">{a.time || "--"}</div>
            <div className="appt-info">
              <div className="appt-pt">{pt ? pt.name : "مريض غير معروف"}</div>
              <div className="appt-note">{a.note || a.purpose || ""}</div>
            </div>
            <div className="appt-card-actions" onClick={(e) => e.stopPropagation()}>
              <span className={`badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
              {isDone ? (
                <button
                  className="appt-act-btn revert"
                  onClick={() => updateAppointment(a.id, { status: "scheduled" })}
                  title="تراجع"
                >
                  <Icon name="undo" />
                </button>
              ) : (
                <button
                  className="appt-act-btn finish"
                  onClick={() => setFinishId(a.id)}
                  title={L("إنهاء الجلسة", "Finish session", lang)}
                >
                  <Icon name="finish" /> {L("إنهاء", "Finish", lang)}
                </button>
              )}
            </div>
          </div>
        );
      })}
      <FinishApptModal apptId={finishId} open={!!finishId} onClose={() => setFinishId(null)} />
    </>
  );
}
