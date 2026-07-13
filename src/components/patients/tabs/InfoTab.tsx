"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDbStore } from "@/stores/useDbStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { patientDebt } from "@/lib/patients";
import { fmtMoney, initials } from "@/lib/format";
import { L } from "@/lib/i18n";
import { buildExamPrintHtml, printHtml } from "@/lib/print";
import { AddEditPatientModal } from "../AddEditPatientModal";
import { ReferralModal } from "../ReferralModal";
import { ConsentModal } from "../ConsentModal";
import { PatientQrBadge } from "../PatientQrBadge";
import type { Patient } from "@/types/db";

const GENDER_LABEL_AR: Record<string, string> = { male: "ذكر", female: "أنثى" };

// Ported from profInfoHtml()/_patientHeroHtml() (app/app.js:2958-3023).
// Referral/Consent/Exam print actions are a later phase (printing infra) —
// see web/MIGRATION_NOTES.md.
export function InfoTab({ patient }: { patient: Patient }) {
  const router = useRouter();
  const lang = useUiPrefsStore((s) => s.lang);
  const db = useDbStore((s) => s.db);
  const deletePatient = useDbStore((s) => s.deletePatient);
  const [editOpen, setEditOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/myfile?pt=${patient.id}`
      : `/myfile?pt=${patient.id}`;

  const debt = patientDebt(db, patient.id);
  const apptCount = db.appointments.filter((a) => a.ptId === patient.id).length;
  const planCount = db.plans.filter((p) => p.ptId === patient.id).length;
  const sub = [patient.gender ? GENDER_LABEL_AR[patient.gender] : "", patient.age ? `${patient.age} سنة` : ""]
    .filter(Boolean)
    .join(" • ");

  function onDelete() {
    if (!confirm(`حذف المريض "${patient.name}"؟`)) return;
    deletePatient(patient.id);
    router.push("/patients");
  }

  return (
    <>
      <div className="profile-hero">
        <div className="profile-photo empty">{initials(patient.name)}</div>
        <div className="profile-hero-id">
          <div className="ph-name">{patient.name}</div>
          {sub && <div className="ph-sub">{sub}</div>}
          {patient.phone && <div className="ph-phone">📞 {patient.phone}</div>}
        </div>
        <PatientQrBadge url={portalUrl} size={80} />
      </div>

      <div className="info-grid">
        <div className="info-row">
          <span>الاسم الكامل</span>
          <b>{patient.name}</b>
        </div>
        <div className="info-row">
          <span>الهاتف</span>
          <b>{patient.phone || "—"}</b>
        </div>
        <div className="info-row">
          <span>العمر</span>
          <b>{patient.age || "—"}</b>
        </div>
        <div className="info-row">
          <span>الجنس</span>
          <b>{patient.gender ? GENDER_LABEL_AR[patient.gender] : "—"}</b>
        </div>
        <div className="info-row">
          <span>العنوان</span>
          <b>{patient.address || "—"}</b>
        </div>
        <div className="info-row">
          <span>الحساسية</span>
          <b>{patient.allergies || "—"}</b>
        </div>
        <div className="info-row">
          <span>التاريخ الطبي</span>
          <b>{patient.medical || "—"}</b>
        </div>
        <div className="info-row">
          <span>ملاحظات</span>
          <b>{patient.notes || "—"}</b>
        </div>
      </div>

      <div className="info-stats">
        <div className="mini-stat">
          <span>إجمالي المواعيد</span>
          <b>{apptCount}</b>
        </div>
        <div className="mini-stat">
          <span>إجمالي الخطط</span>
          <b>{planCount}</b>
        </div>
        <div className="mini-stat warn">
          <span>الرصيد المستحق</span>
          <b>{fmtMoney(debt)}</b>
        </div>
      </div>

      <div className="row gap mt-3" style={{ flexWrap: "wrap" }}>
        <button className="btn" onClick={() => setEditOpen(true)}>
          {L("تعديل", "Edit", lang)}
        </button>
        <button className="btn" onClick={() => setRefOpen(true)}>
          📄 {L("إحالة", "Referral", lang)}
        </button>
        <button className="btn" onClick={() => setConsentOpen(true)}>
          ✍️ {L("موافقة", "Consent", lang)}
        </button>
        <button className="btn" onClick={() => printHtml(buildExamPrintHtml(db, patient, lang))}>
          🦷 {L("فحص عام", "Exam", lang)}
        </button>
        <button className="btn btn-danger" onClick={onDelete}>
          {L("حذف المريض", "Delete patient", lang)}
        </button>
      </div>

      <AddEditPatientModal open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <ReferralModal patient={patient} open={refOpen} onClose={() => setRefOpen(false)} />
      <ConsentModal patient={patient} open={consentOpen} onClose={() => setConsentOpen(false)} />
    </>
  );
}
