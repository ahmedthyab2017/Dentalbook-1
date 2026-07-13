import { useDbStore } from "@/stores/useDbStore";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Patient } from "@/types/db";

const ACTION_LABEL_AR: Record<string, string> = {
  create: "+ إنشاء",
  update: "✏️ تعديل",
  delete: "🗑 حذف",
};

// Ported from profAuditHtml() (app/app.js:2906-2942).
export function AuditTab({ patient }: { patient: Patient }) {
  const auditLog = useDbStore((s) => s.db.auditLog);
  const entries = auditLog.filter((a) => a.ptId === patient.id).slice(0, 100).reverse();

  if (entries.length === 0) {
    return <EmptyState>لا يوجد سجل تدقيق بعد</EmptyState>;
  }

  return (
    <div className="audit-list">
      {entries.map((a) => (
        <div className="audit-item" key={a.id}>
          <div className="audit-time">{new Date(a.at).toLocaleString("ar-IQ")}</div>
          <div className="audit-action">
            <b>{ACTION_LABEL_AR[a.action] || a.action}</b> <span className="audit-entity">{a.entity || ""}</span>
          </div>
          <div className="audit-who">{a.who || "—"}</div>
          {a.note && <div className="audit-note">{a.note}</div>}
        </div>
      ))}
    </div>
  );
}
