"use client";

import { StatCard } from "@/components/ui/StatCard";
import { useDbStore } from "@/stores/useDbStore";
import { fmtMoney, todayStr } from "@/lib/format";
import type { SessionUser } from "@/types/session";

// Ported from render_dashboard() stats section (app/app.js:2366-2394).
export function DashboardStats({ user }: { user: SessionUser }) {
  const db = useDbStore((s) => s.db);
  const isOwner = user.role === "owner";
  const today = todayStr();

  const todayAppts = db.appointments.filter((a) => a.date === today && a.status !== "cancelled").length;
  const totalPts = db.patients.length;
  const pendingPlans = db.plans.filter((p) => p.status === "active").length;

  let revenue = 0;
  let expenses = 0;
  const monthPrefix = today.slice(0, 7);
  db.payments.forEach((p) => {
    if (p.date && p.date.startsWith(monthPrefix)) revenue += Number(p.amount) || 0;
  });
  db.expenses.forEach((e) => {
    if (e.date && e.date.startsWith(monthPrefix)) expenses += Number(e.amount) || 0;
  });

  return (
    <div className="stats-grid">
      <StatCard color="teal" icon="calendar" label="مواعيد اليوم" value={String(todayAppts)} />
      <StatCard color="violet" icon="users" label="إجمالي المرضى" value={String(totalPts)} />
      <StatCard color="amber" icon="clipboard" label="خطط نشطة" value={String(pendingPlans)} />
      {isOwner && (
        <>
          <StatCard color="green" icon="wallet" label="وارد الشهر" value={fmtMoney(revenue)} />
          <StatCard color="rose" icon="trending" label="مصاريف الشهر" value={fmtMoney(expenses)} />
          <StatCard color="brass" icon="chart" label="صافي الشهر" value={fmtMoney(revenue - expenses)} />
        </>
      )}
    </div>
  );
}
