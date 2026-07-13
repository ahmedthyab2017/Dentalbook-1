"use client";

import { useState } from "react";
import { useDbStore } from "@/stores/useDbStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtDateShort, todayStr } from "@/lib/format";
import { printRx } from "@/lib/print";
import { L } from "@/lib/i18n";
import type { Patient } from "@/types/db";
export function RxTab({ patient }: { patient: Patient }) {
  const lang = useUiPrefsStore((s) => s.lang);
  const db = useDbStore((s) => s.db);
  const addPrescription = useDbStore((s) => s.addPrescription);
  const [modalOpen, setModalOpen] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medDuration, setMedDuration] = useState("");

  const list = db.prescriptions
    .filter((r) => r.ptId === patient.id)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  function save() {
    if (!medName.trim()) return;
    addPrescription({
      ptId: patient.id,
      date: todayStr(),
      meds: [{ name: medName.trim(), dose: medDose.trim(), duration: medDuration.trim() }],
    });
    setMedName("");
    setMedDose("");
    setMedDuration("");
    setModalOpen(false);
  }

  return (
    <>
      <div className="text-end mb-3">
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          وصفة جديدة
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState>لا توجد وصفات</EmptyState>
      ) : (
        list.map((r) => (
          <div className="rx-card" key={r.id}>
            <div className="rx-head">
              <b>{fmtDateShort(r.date)}</b>
              <button className="btn btn-sm" onClick={() => printRx(db, r.id, lang)}>
                {L("طباعة", "Print", lang)}
              </button>
            </div>
            <div className="rx-meds">
              {r.meds.map((m, i) => (
                <div className="rx-med" key={i}>
                  • {m.name} — {m.dose || ""} {m.duration || ""}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="وصفة جديدة">
        <div className="modal-body">
          <div className="form-grid">
            <div className="field span-2">
              <label>اسم الدواء</label>
              <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} />
            </div>
            <div className="field">
              <label>الجرعة</label>
              <input type="text" value={medDose} onChange={(e) => setMedDose(e.target.value)} />
            </div>
            <div className="field">
              <label>المدة</label>
              <input type="text" value={medDuration} onChange={(e) => setMedDuration(e.target.value)} />
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
