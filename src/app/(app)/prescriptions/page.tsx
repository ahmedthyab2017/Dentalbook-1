"use client";

import { useState } from "react";
import { DantalPage } from "@/components/layout/DantalPage";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDbStore } from "@/stores/useDbStore";
import { fmtDateShort, todayStr } from "@/lib/format";

export default function PrescriptionsPage() {
  const db = useDbStore((s) => s.db);
  const addPrescription = useDbStore((s) => s.addPrescription);
  const deletePrescription = useDbStore((s) => s.deletePrescription);

  const [modalOpen, setModalOpen] = useState(false);
  const [ptId, setPtId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [medName, setMedName] = useState("");
  const [dose, setDose] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const list = [...db.prescriptions]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 50);

  function save() {
    if (!ptId || !medName.trim()) return;
    addPrescription({
      ptId,
      date,
      meds: [{ name: medName.trim(), dose: dose.trim(), duration: duration.trim() }],
      notes: notes.trim(),
    });
    setModalOpen(false);
    setMedName("");
    setDose("");
    setDuration("");
    setNotes("");
  }

  return (
    <DantalPage title="الوصفات">
        <div className="page-head">
          <h1 className="page-title">الوصفات</h1>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + وصفة جديدة
          </button>
        </div>

        {list.length === 0 ? (
          <EmptyState>لا توجد وصفات</EmptyState>
        ) : (
          list.map((r) => {
            const pt = db.patients.find((p) => p.id === r.ptId);
            return (
              <div className="rx-card" key={r.id}>
                <div className="rx-head">
                  <div>
                    <b>{pt?.name || "—"}</b>
                    <div className="muted">{fmtDateShort(r.date)}</div>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        if (confirm("حذف الوصفة؟")) deletePrescription(r.id);
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
                <div className="rx-meds">
                  {r.meds.map((m, i) => (
                    <div key={i}>
                      • {m.name}
                      {m.dose ? ` — ${m.dose}` : ""}
                      {m.duration ? ` (${m.duration})` : ""}
                    </div>
                  ))}
                  {r.notes && <div className="muted">{r.notes}</div>}
                </div>
              </div>
            );
          })
        )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="وصفة جديدة">
        <div className="modal-body">
          <div className="form-grid">
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
            <div className="field">
              <label>التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label>الدواء</label>
              <input value={medName} onChange={(e) => setMedName(e.target.value)} />
            </div>
            <div className="field">
              <label>الجرعة</label>
              <input value={dose} onChange={(e) => setDose(e.target.value)} />
            </div>
            <div className="field">
              <label>المدة</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="field full">
              <label>ملاحظات</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
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
    </DantalPage>
  );
}
