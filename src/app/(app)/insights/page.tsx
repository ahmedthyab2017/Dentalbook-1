"use client";

import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import { useDbStore } from "@/stores/useDbStore";
import { last6MonthsRevenue } from "@/lib/reports-utils";
import { fmtMoney, todayStr } from "@/lib/format";

export default function InsightsPage() {
  return (
    <DantalPage title="مؤشرات الأداء">
        <OwnerOnly>
          <InsightsContent />
        </OwnerOnly>
      </DantalPage>
  );
}

function InsightsContent() {
  const db = useDbStore((s) => s.db);
  const today = todayStr();
  const thisMonth = today.slice(0, 7);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth =
    lastMonthDate.getFullYear() + "-" + String(lastMonthDate.getMonth() + 1).padStart(2, "0");

  const revThis = db.payments.filter((p) => p.date?.startsWith(thisMonth)).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const revLast = db.payments.filter((p) => p.date?.startsWith(lastMonth)).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const revChange = revLast > 0 ? Math.round(((revThis - revLast) / revLast) * 100) : null;

  const monthStart = new Date(today.slice(0, 7) + "-01").getTime();
  const newPts = db.patients.filter((p) => (p.createdAt || 0) >= monthStart).length;

  const pastAppts = db.appointments.filter((a) => a.date && a.date < today);
  const completed = pastAppts.filter((a) => a.status === "completed").length;
  const noShow = pastAppts.filter((a) => a.status === "cancelled" || a.status === "confirmed").length;
  const attendance = completed + noShow > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0;

  const allPlans = db.plans.length;
  const accepted = db.plans.filter((p) => p.status === "active" || p.status === "completed").length;
  const acceptance = allPlans > 0 ? Math.round((accepted / allPlans) * 100) : 0;

  const planTotal = db.plans.filter((p) => p.status !== "cancelled").reduce((s, p) => s + (Number(p.totalCost) || 0), 0);
  const paidTotal = db.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const outstanding = Math.max(0, planTotal - paidTotal);
  const avgPerPt = db.patients.length > 0 ? Math.round(paidTotal / db.patients.length) : 0;

  const growth = last6MonthsRevenue(db);
  const maxRev = Math.max(...growth.map((g) => g.revenue), 1);

  const kpis = [
    { label: "وارد الشهر", value: fmtMoney(revThis), sub: revChange != null ? `${revChange > 0 ? "+" : ""}${revChange}% عن الشهر الماضي` : "" },
    { label: "مرضى جدد", value: String(newPts), sub: "هذا الشهر" },
    { label: "نسبة الحضور", value: `${attendance}%`, sub: `${completed} من ${completed + noShow}` },
    { label: "قبول العلاج", value: `${acceptance}%`, sub: `${accepted}/${allPlans} خطط` },
    { label: "المتبقي", value: fmtMoney(outstanding), sub: "إجمالي العيادة" },
    { label: "متوسط/مريض", value: fmtMoney(avgPerPt), sub: `${db.patients.length} مريض` },
  ];

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">مؤشرات الأداء</h1>
      </div>
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            {k.sub && <div className="kpi-sub muted">{k.sub}</div>}
          </div>
        ))}
      </div>
      <div className="card mt-3">
        <div className="card-head"><h3>اتجاه الوارد (6 أشهر)</h3></div>
        <div className="ins-bars">
          {growth.map((g) => (
            <div className="ins-bar-col" key={g.month}>
              <div className="ins-bar" style={{ height: `${Math.round((g.revenue / maxRev) * 100)}%` }} />
              <div className="ins-bar-label">{g.month.slice(5)}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="muted mt-3">جميع المبالغ بالدينار العراقي (IQD)</p>
    </>
  );
}
