"use client";

import { useState } from "react";
import { useDbStore } from "@/stores/useDbStore";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtDateShort, todayStr } from "@/lib/format";
import type { AppointmentStatus, Patient } from "@/types/db";

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

// Ported from profApptsHtml() (app/app.js:3573-3595).
export function AppointmentsTab({ patient }: { patient: Patient }) {
  const db = useDbStore((s) => s.db);
  const addAppointment = useDbStore((s) => s.addAppointment);
  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [note, setNote] = useState("");

  const list = db.appointments
    .filter((a) => a.ptId === patient.id)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  function save() {
    if (!date) return;
    addAppointment({ ptId: patient.id, date, time, purpose: purpose.trim(), note: note.trim(), status: "scheduled" });
    setTime("");
    setPurpose("");
    setNote("");
    setModalOpen(false);
  }

  return (
    <>
      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          موعد جديد
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState>لا توجد مواعيد</EmptyState>
      ) : (
        list.map((a) => (
          <div className="appt-card" key={a.id}>
            <div className="appt-time">
              {fmtDateShort(a.date)}
              <br />
              <small>{a.time || ""}</small>
            </div>
            <div className="appt-info">
              <div className="appt-pt">{a.purpose || a.note || "زيارة"}</div>
              <div className="appt-note">{a.note || ""}</div>
            </div>
            <span className={`badge ${STATUS_BADGE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
          </div>
        ))
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="موعد جديد">
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label>الوقت</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="field span-2">
              <label>الغرض</label>
              <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
            <div className="field span-2">
              <label>ملاحظات</label>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={save}>
            حفظ
          </button>
        </div>
      </Modal>
    </>
  );
}
