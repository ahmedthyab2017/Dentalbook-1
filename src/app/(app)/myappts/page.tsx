"use client";

import { useState } from "react";
import { DantalPage } from "@/components/layout/DantalPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { useSessionStore } from "@/stores/useSessionStore";
import { useDbStore } from "@/stores/useDbStore";
import { APPT_STATUS_BADGE, APPT_STATUS_LABEL } from "@/lib/appointments-utils";
import { fmtDateShort } from "@/lib/format";

export default function MyApptsPage() {
  const user = useSessionStore((s) => s.user);
  const db = useDbStore((s) => s.db);
  const ptId = user?.ptId || user?.id || "";
  const [modalOpen, setModalOpen] = useState(false);

  const list = db.appointments
    .filter((a) => a.ptId === ptId)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  return (
    <DantalPage title="مواعيدي">
        <div className="page-head">
          <h1 className="page-title">مواعيدي</h1>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ حجز موعد</button>
        </div>
        {list.length === 0 ? (
          <EmptyState>لا مواعيد</EmptyState>
        ) : (
          list.map((a) => (
            <div className="appt-card" key={a.id}>
              <div className="appt-time">
                <div className="muted">{fmtDateShort(a.date)}</div>
                {a.time || "--"}
              </div>
              <div className="appt-info">
                <div className="appt-pt">{a.purpose || "زيارة"}</div>
                <div className="appt-note">{a.note || ""}</div>
              </div>
              <span className={`badge ${APPT_STATUS_BADGE[a.status]}`}>{APPT_STATUS_LABEL[a.status]}</span>
            </div>
          ))
        )}
      <AppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} fixedPtId={ptId} />
    </DantalPage>
  );
}
