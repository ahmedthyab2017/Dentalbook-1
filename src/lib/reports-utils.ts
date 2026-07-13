import type { DentistDb } from "@/types/db";
import { todayStr } from "@/lib/format";

export type ReportPeriod = "today" | "week" | "month" | "year";

export function reportRange(period: ReportPeriod): { start: string; end: string } {
  const end = todayStr();
  const d = new Date();
  if (period === "today") return { start: end, end };
  if (period === "week") {
    d.setDate(d.getDate() - 6);
    const start =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");
    return { start, end };
  }
  if (period === "year") return { start: end.slice(0, 4) + "-01-01", end };
  return { start: end.slice(0, 7) + "-01", end };
}

export function filterByDateRange<T extends { date?: string }>(
  items: T[],
  start: string,
  end: string
): T[] {
  return items.filter((x) => x.date && x.date >= start && x.date <= end);
}

export function topPatientsByPayments(db: DentistDb, start: string, end: string, limit = 10) {
  const sums = new Map<string, number>();
  for (const p of filterByDateRange(db.payments, start, end)) {
    sums.set(p.ptId, (sums.get(p.ptId) || 0) + (Number(p.amount) || 0));
  }
  return [...sums.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ptId, total]) => ({
      patient: db.patients.find((p) => p.id === ptId),
      total,
    }));
}

export function last6MonthsRevenue(db: DentistDb): { month: string; revenue: number }[] {
  const result: { month: string; revenue: number }[] = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const prefix =
      m.getFullYear() + "-" + String(m.getMonth() + 1).padStart(2, "0");
    const revenue = db.payments
      .filter((p) => p.date?.startsWith(prefix))
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    result.push({ month: prefix, revenue });
  }
  return result;
}

export function last14DaysChart(db: DentistDb) {
  const days: { date: string; revenue: number; expense: number }[] = [];
  const d = new Date();
  for (let i = 13; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(day.getDate() - i);
    const date =
      day.getFullYear() +
      "-" +
      String(day.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(day.getDate()).padStart(2, "0");
    const revenue = db.payments
      .filter((p) => p.date === date)
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const expense = db.expenses
      .filter((e) => e.date === date)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    days.push({ date, revenue, expense });
  }
  return days;
}
