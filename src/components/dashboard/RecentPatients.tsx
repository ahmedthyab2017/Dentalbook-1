"use client";

import { useRouter } from "next/navigation";
import { useDbStore } from "@/stores/useDbStore";
import { EmptyState } from "@/components/ui/EmptyState";
import { initials } from "@/lib/format";

// Ported from render_dashboard() recent-patients section (app/app.js:2425-2440).
export function RecentPatients() {
  const router = useRouter();
  const patients = useDbStore((s) => s.db.patients);

  const recent = [...patients].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

  if (recent.length === 0) {
    return <EmptyState>لا يوجد مرضى بعد</EmptyState>;
  }

  return (
    <>
      {recent.map((p) => (
        <div
          className="patient-card"
          key={p.id}
          onClick={() => router.push(`/patients/${p.id}`)}
          style={{ cursor: "pointer" }}
        >
          <div className="pt-avatar">{initials(p.name)}</div>
          <div className="pt-info">
            <div className="pt-name">{p.name}</div>
            <div className="pt-meta">{p.phone || ""}</div>
          </div>
        </div>
      ))}
    </>
  );
}
