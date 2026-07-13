"use client";

import { useRouter } from "next/navigation";
import type { Patient } from "@/types/db";
import { initials, fmtMoney, fmtDateShort } from "@/lib/format";

export function PatientListItem({
  patient,
  debt,
  lastSession,
}: {
  patient: Patient;
  debt: number;
  lastSession: string | null;
}) {
  const router = useRouter();

  return (
    <div className="patient-card">
      <div className="pt-avatar" onClick={() => router.push(`/patients/${patient.id}`)}>
        {initials(patient.name)}
      </div>
      <div className="pt-info" onClick={() => router.push(`/patients/${patient.id}`)}>
        <div className="pt-name">{patient.name}</div>
        <div className="pt-meta">
          {patient.phone ? `📞 ${patient.phone}` : ""}
          {patient.age ? ` • ${patient.age} سنة` : ""}
        </div>
        <div className="pt-meta pt-sub">
          {patient.address ? `📍 ${patient.address}` : ""}
          {lastSession ? `${patient.address ? " • " : ""}🦷 آخر جلسة: ${fmtDateShort(lastSession)}` : ""}
        </div>
      </div>
      <div className="pt-card-actions">
        {debt > 0 && <span className="badge badge-warn">{fmtMoney(debt)}</span>}
        {patient.phone && (
          <a
            className="pt-wa-btn"
            href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="متابعة واتساب"
          >
            📱
          </a>
        )}
      </div>
    </div>
  );
}
