"use client";

import { KpiCard } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { fmtMoney, todayStr } from "@/lib/format";
import type { SessionUser } from "@/types/session";
import { Calendar, Users, ClipboardList, Wallet, Receipt, TrendingUp } from "lucide-react";

export function DantalDashboardKpis({ user }: { user: SessionUser }) {
  const db = useDbStore((s) => s.db);
  const isOwner = user.role === "owner";
  const today = todayStr();
  const monthPrefix = today.slice(0, 7);

  const todayAppts = db.appointments.filter((a) => a.date === today && a.status !== "cancelled").length;
  const totalPts = db.patients.length;
  const pendingPlans = db.plans.filter((p) => p.status === "active").length;
  const doctors = db.staff.filter((s) => s.role === "doctor" || s.isOwner).length;

  let revenue = 0;
  let expenses = 0;
  db.payments.forEach((p) => {
    if (p.date?.startsWith(monthPrefix)) revenue += Number(p.amount) || 0;
  });
  db.expenses.forEach((e) => {
    if (e.date?.startsWith(monthPrefix)) expenses += Number(e.amount) || 0;
  });

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="مواعيد اليوم" value={String(todayAppts)} icon={Calendar} accent="primary" />
      <KpiCard label="إجمالي المرضى" value={String(totalPts)} icon={Users} accent="secondary" />
      <KpiCard label="خطط نشطة" value={String(pendingPlans)} icon={ClipboardList} accent="warning" />
      <KpiCard label="الأطباء" value={String(doctors)} icon={TrendingUp} accent="success" />
      {isOwner && (
        <>
          <KpiCard label="وارد الشهر" value={fmtMoney(revenue)} icon={Wallet} accent="success" />
          <KpiCard label="مصاريف الشهر" value={fmtMoney(expenses)} icon={Receipt} accent="warning" />
          <KpiCard
            label="صافي الشهر"
            value={fmtMoney(revenue - expenses)}
            icon={TrendingUp}
            accent={revenue - expenses >= 0 ? "primary" : "warning"}
          />
        </>
      )}
    </div>
  );
}
