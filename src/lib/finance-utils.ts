import type { DentistDb, Settlement } from "@/types/db";
import { patientDebt } from "@/lib/patients";
import { uid } from "@/lib/id";

export function paymentTs(p: { createdAt?: number; date?: string }): number {
  if (p.createdAt) return p.createdAt;
  if (p.date) return new Date(p.date).getTime();
  return 0;
}

export function doctorGrossSince(db: DentistDb, doctorId: string, sinceTs: number): number {
  const planIds = new Set(
    db.plans.filter((pl) => pl.doctorId === doctorId).map((pl) => pl.id)
  );
  return db.payments
    .filter((p) => p.planId && planIds.has(p.planId) && paymentTs(p) > sinceTs)
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
}

export function doctorLastSettledAt(db: DentistDb, doctorId: string): number {
  const baseline = (db.meta as { accountsBaselineAt?: number }).accountsBaselineAt || 0;
  const last = db.settlements
    .filter((s) => s.doctorId === doctorId)
    .reduce((max, s) => Math.max(max, s.at), 0);
  return Math.max(baseline, last);
}

export function payMethodLabel(m: string): string {
  const map: Record<string, string> = {
    cash: "نقدي",
    card: "بطاقة",
    transfer: "تحويل",
    zaincash: "زين كاش",
  };
  return map[m] || m;
}

export function allDebtors(db: DentistDb) {
  return db.patients
    .map((p) => ({ patient: p, debt: patientDebt(db, p.id) }))
    .filter((x) => x.debt > 0)
    .sort((a, b) => b.debt - a.debt);
}

export function doctorCommissions(db: DentistDb) {
  return db.staff
    .filter((s) => s.role === "doctor" || s.isOwner)
    .map((doc) => {
      const plans = db.plans.filter(
        (p) => p.status === "completed" && p.doctorId === doc.id
      );
      const pct = Number(doc.commissionPct) || 0;
      const total = plans.reduce(
        (s, p) => s + (Number(p.totalCost) || 0) * (pct / 100),
        0
      );
      return { doctor: doc, planCount: plans.length, commission: total, pct };
    });
}

export type SettlementMode = "doctor_holds" | "clinic_holds";

export function createSettlement(
  db: DentistDb,
  doctorId: string,
  mode: SettlementMode,
  by: string
): Settlement {
  const doc = db.staff.find((s) => s.id === doctorId);
  const sinceAt = doctorLastSettledAt(db, doctorId);
  const gross = doctorGrossSince(db, doctorId, sinceAt);
  const pct = Number(doc?.commissionPct) || 0;
  const doctorShare = gross * (pct / 100);
  const clinicShare = gross - doctorShare;
  return {
    id: `set_${Date.now()}`,
    doctorId,
    doctorName: doc?.name || "—",
    at: Date.now(),
    by,
    sinceAt,
    gross,
    doctorShare,
    clinicShare,
    commissionPct: pct,
    mode,
  };
}

export function archiveAndZeroAccounts(db: DentistDb, by: string, reason: string): DentistDb {
  const doctors = db.staff.filter((s) => s.role === "doctor");
  const outstanding = doctors.map((d) => {
    const since = doctorLastSettledAt(db, d.id);
    const gross = doctorGrossSince(db, d.id, since);
    const pct = Number(d.commissionPct) || 0;
    const doctorShare = Math.round(gross * pct / 100);
    return { doctorId: d.id, name: d.name, gross, pct, doctorShare, clinicShare: gross - doctorShare };
  });
  const archive = {
    id: uid("arch_"),
    at: Date.now(),
    by,
    reason,
    settlements: JSON.parse(JSON.stringify(db.settlements || [])),
    outstanding,
    totals: {
      settledGross: (db.settlements || []).reduce((s, x) => s + (Number(x.gross) || 0), 0),
      outstandingGross: outstanding.reduce((s, x) => s + x.gross, 0),
    },
  };
  return {
    ...db,
    archives: [...(db.archives || []), archive],
    settlements: [],
    meta: { ...db.meta, accountsBaselineAt: Date.now() },
  };
}
