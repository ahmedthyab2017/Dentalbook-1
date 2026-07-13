"use client";

import { DantalPage } from "@/components/layout/DantalPage";
import { useSessionStore } from "@/stores/useSessionStore";
import { useDbStore } from "@/stores/useDbStore";
import { patientDebt } from "@/lib/patients";
import { fmtMoney, initials } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

const GENDER_LABEL: Record<string, string> = { male: "ذكر", female: "أنثى" };

export default function MyFilePage() {
  const user = useSessionStore((s) => s.user);
  const db = useDbStore((s) => s.db);
  const ptId = user?.ptId || user?.id;
  const patient = db.patients.find((p) => p.id === ptId);

  if (!patient) {
    return (
      <DantalPage title="ملفي الطبي"><EmptyState>لم يتم العثور على ملفك</EmptyState></DantalPage>
    );
  }

  const debt = patientDebt(db, patient.id);
  const apptCount = db.appointments.filter((a) => a.ptId === patient.id).length;
  const planCount = db.plans.filter((p) => p.ptId === patient.id).length;

  return (
    <DantalPage title="ملفي الطبي">
        <div className="page-head"><h1 className="page-title">ملفي الطبي</h1></div>
        <div className="profile-hero">
          <div className="profile-photo empty">{initials(patient.name)}</div>
          <div className="profile-hero-id">
            <div className="ph-name">{patient.name}</div>
            {patient.phone && <div className="ph-phone">📞 {patient.phone}</div>}
          </div>
        </div>
        <div className="info-grid">
          <div className="info-row"><span>العمر</span><b>{patient.age || "—"}</b></div>
          <div className="info-row"><span>الجنس</span><b>{patient.gender ? GENDER_LABEL[patient.gender] : "—"}</b></div>
          <div className="info-row"><span>العنوان</span><b>{patient.address || "—"}</b></div>
          <div className="info-row"><span>الحساسية</span><b>{patient.allergies || "—"}</b></div>
          <div className="info-row"><span>التاريخ الطبي</span><b>{patient.medical || "—"}</b></div>
        </div>
        <div className="stats-grid mt-3">
          <div className="stat-card"><div className="stat-label">المواعيد</div><div className="stat-value">{apptCount}</div></div>
          <div className="stat-card"><div className="stat-label">خطط العلاج</div><div className="stat-value">{planCount}</div></div>
          <div className="stat-card"><div className="stat-label">الرصيد</div><div className="stat-value">{fmtMoney(debt)}</div></div>
        </div>
      </DantalPage>
  );
}
