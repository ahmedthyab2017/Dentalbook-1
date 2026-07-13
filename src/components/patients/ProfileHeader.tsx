"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { Patient } from "@/types/db";

const GENDER_LABEL_AR: Record<string, string> = { male: "ذكر", female: "أنثى" };

export function ProfileHeader({ patient }: { patient: Patient }) {
  const router = useRouter();
  const sub = [patient.phone, patient.age ? `${patient.age} سنة` : "", patient.gender ? GENDER_LABEL_AR[patient.gender] : ""]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="page-head">
      <button className="icon-btn" onClick={() => router.push("/patients")} title="رجوع">
        <Icon name="back" />
      </button>
      <div>
        <div className="page-head-title mt-2">{patient.name}</div>
        <div className="muted">{sub}</div>
      </div>
    </div>
  );
}
