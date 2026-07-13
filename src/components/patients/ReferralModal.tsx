"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDbStore } from "@/stores/useDbStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { REFERRAL_SPECIALTIES } from "@/lib/referral-specialties";
import { buildReferralPrintHtml, printHtml, type ReferralDraft } from "@/lib/print";
import type { Patient } from "@/types/db";
import { uid } from "@/lib/id";

export function ReferralModal({
  patient,
  open,
  onClose,
}: {
  patient: Patient;
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const db = useDbStore((s) => s.db);
  const replaceDb = useDbStore((s) => s.replaceDb);

  const [specialty, setSpecialty] = useState("ortho");
  const [toDoctor, setToDoctor] = useState("");
  const [reason, setReason] = useState("");
  const [findings, setFindings] = useState("");
  const [urgency, setUrgency] = useState<ReferralDraft["urgency"]>("routine");

  function print() {
    const draft: ReferralDraft = { ptId: patient.id, specialty, toDoctor, reason, findings, urgency };
    const next = { ...db, referrals: [...(db.referrals || []), { id: uid("ref_"), ptId: patient.id, specialty, toDoctor, reason, urgency, at: Date.now() }] };
    replaceDb(next);
    printHtml(buildReferralPrintHtml(db, patient, draft, lang));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={L("إحالة طبية", "Medical Referral", lang)}>
      <div className="modal-body">
        <div className="form-grid">
          <div className="field span-2">
            <label>{L("التخصص", "Specialty", lang)}</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              {REFERRAL_SPECIALTIES.map((s) => (
                <option key={s.k} value={s.k}>{L(s.ar, s.en, lang)}</option>
              ))}
            </select>
          </div>
          <div className="field span-2">
            <label>{L("اسم الطبيب (اختياري)", "Doctor name (optional)", lang)}</label>
            <input value={toDoctor} onChange={(e) => setToDoctor(e.target.value)} />
          </div>
          <div className="field span-2">
            <label>{L("سبب الإحالة", "Reason", lang)}</label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="field span-2">
            <label>{L("ملاحظات سريرية", "Clinical findings", lang)}</label>
            <textarea rows={2} value={findings} onChange={(e) => setFindings(e.target.value)} />
          </div>
          <div className="field span-2">
            <label>{L("الأولوية", "Urgency", lang)}</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value as ReferralDraft["urgency"])}>
              <option value="routine">{L("روتيني", "Routine", lang)}</option>
              <option value="soon">{L("قريب", "Soon", lang)}</option>
              <option value="urgent">{L("عاجل", "Urgent", lang)}</option>
            </select>
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>{L("إلغاء", "Cancel", lang)}</button>
        <button className="btn btn-primary" onClick={print}>🖨 {L("طباعة الإحالة", "Print Referral", lang)}</button>
      </div>
    </Modal>
  );
}
