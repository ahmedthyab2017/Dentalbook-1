import type { DentistDb } from "@/types/db";

// Ported from app/app.js:2743-2751 (patientDebt).
export function patientDebt(db: DentistDb, ptId: string): number {
  const planTotal = db.plans
    .filter((p) => p.ptId === ptId && p.status !== "cancelled")
    .reduce((s, p) => s + (Number(p.totalCost) || 0), 0);
  const paid = db.payments
    .filter((p) => p.ptId === ptId)
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return Math.max(0, planTotal - paid);
}

// Simplified port of _lastSessionDate (app/app.js:2589+): most recent
// completed plan session date for this patient, if any.
export function lastSessionDate(db: DentistDb, ptId: string): string | null {
  let latest: string | null = null;
  for (const plan of db.plans) {
    if (plan.ptId !== ptId) continue;
    for (const session of plan.sessions) {
      if ((session.done || session.completed) && session.date) {
        if (!latest || session.date > latest) latest = session.date;
      }
    }
  }
  return latest;
}
