"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDbStore } from "@/stores/useDbStore";
import type { Appointment, AppointmentStatus } from "@/types/db";
import { todayStr } from "@/lib/format";

export function AppointmentModal({
  open,
  onClose,
  appointment,
  fixedPtId,
}: {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment;
  fixedPtId?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={appointment ? "تعديل موعد" : "موعد جديد"}>
      <ApptForm
        key={appointment?.id || fixedPtId || "new"}
        appointment={appointment}
        fixedPtId={fixedPtId}
        onClose={onClose}
      />
    </Modal>
  );
}

function ApptForm({
  appointment,
  fixedPtId,
  onClose,
}: {
  appointment?: Appointment;
  fixedPtId?: string;
  onClose: () => void;
}) {
  const db = useDbStore((s) => s.db);
  const addAppointment = useDbStore((s) => s.addAppointment);
  const updateAppointment = useDbStore((s) => s.updateAppointment);

  const [ptId, setPtId] = useState(fixedPtId || appointment?.ptId || "");
  const [date, setDate] = useState(appointment?.date || todayStr());
  const [time, setTime] = useState(appointment?.time || "10:00");
  const [purpose, setPurpose] = useState(appointment?.purpose || "");
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status || "scheduled");
  const [note, setNote] = useState(appointment?.note || "");

  function save() {
    if (!ptId) return;
    const payload = { ptId, date, time, purpose, status, note };
    if (appointment) {
      updateAppointment(appointment.id, { ...payload, updatedAt: Date.now() });
    } else {
      addAppointment(payload);
    }
    onClose();
  }

  return (
    <>
      <div className="modal-body">
        <div className="form-grid">
          {!fixedPtId && (
            <div className="field">
              <label>المريض</label>
              <select value={ptId} onChange={(e) => setPtId(e.target.value)}>
                <option value="">— اختر —</option>
                {db.patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label>التاريخ</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>الوقت</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="field">
            <label>الغرض</label>
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="field">
            <label>الحالة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus)}>
              <option value="scheduled">مجدول</option>
              <option value="confirmed">مؤكد</option>
              <option value="completed">منجز</option>
              <option value="cancelled">ملغى</option>
              <option value="no-show">لم يحضر</option>
            </select>
          </div>
          <div className="field full">
            <label>ملاحظات</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>
          إلغاء
        </button>
        <button className="btn btn-primary" onClick={save}>
          حفظ
        </button>
      </div>
    </>
  );
}
