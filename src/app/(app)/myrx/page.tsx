"use client";

import { DantalPage } from "@/components/layout/DantalPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSessionStore } from "@/stores/useSessionStore";
import { useDbStore } from "@/stores/useDbStore";
import { fmtDateShort } from "@/lib/format";

export default function MyRxPage() {
  const user = useSessionStore((s) => s.user);
  const db = useDbStore((s) => s.db);
  const ptId = user?.ptId || user?.id || "";

  const list = db.prescriptions
    .filter((r) => r.ptId === ptId)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <DantalPage title="وصفاتي">
        <div className="page-head"><h1 className="page-title">وصفاتي</h1></div>
        {list.length === 0 ? (
          <EmptyState>لا وصفات</EmptyState>
        ) : (
          list.map((r) => (
            <div className="rx-card" key={r.id}>
              <div className="rx-head">
                <div className="muted">{fmtDateShort(r.date)}</div>
              </div>
              <div className="rx-meds">
                {r.meds.map((m, i) => (
                  <div key={i}>
                    • {m.name}
                    {m.dose ? ` — ${m.dose}` : ""}
                    {m.duration ? ` (${m.duration})` : ""}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </DantalPage>
  );
}
