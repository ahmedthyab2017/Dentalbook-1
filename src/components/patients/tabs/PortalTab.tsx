"use client";

import { Cloud } from "@/lib/cloud";
import { EmptyState } from "@/components/ui/EmptyState";
import { PatientQrBadge } from "@/components/patients/PatientQrBadge";

export function PortalTab({ ptId, ptName }: { ptId: string; ptName: string }) {
  const configured = Cloud.configured();
  const authed = Cloud.loggedIn();

  const portalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/myfile?pt=${encodeURIComponent(ptId)}`
      : `/myfile?pt=${ptId}`;

  if (!configured || !authed) {
    return (
      <div className="card">
        <div className="card-head"><h3>بوابة المريض</h3></div>
        <EmptyState>
          فعّل Cloud Sync من الإعدادات للمزامنة السحابية. يمكنك استخدام QR محلي بدون سحابة:
        </EmptyState>
        <div className="row gap mt-3" style={{ alignItems: "center" }}>
          <PatientQrBadge url={portalUrl} size={120} />
          <code style={{ flex: 1, padding: 12, background: "var(--surface-2)", borderRadius: 8, wordBreak: "break-all" }}>
            {portalUrl}
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-head"><h3>بوابة المريض</h3></div>
      <p className="muted">Cloud Sync متصل — <b>{ptName}</b></p>
      <div className="row gap mt-3" style={{ alignItems: "center" }}>
        <PatientQrBadge url={portalUrl} size={120} />
        <div style={{ flex: 1 }}>
          <code style={{ display: "block", padding: 12, background: "var(--surface-2)", borderRadius: 8, wordBreak: "break-all" }}>
            {portalUrl}
          </code>
          <p className="muted mt-2">امسح QR أو شارك الرابط مع المريض للوصول لملفه.</p>
        </div>
      </div>
    </div>
  );
}
