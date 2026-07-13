"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  KpiCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
} from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import {
  reportRange,
  filterByDateRange,
  topPatientsByPayments,
  last6MonthsRevenue,
  last14DaysChart,
  type ReportPeriod,
} from "@/lib/reports-utils";
import { fmtMoney } from "@/lib/format";
import { slideUp } from "@/lib/motion";

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "today", label: "اليوم" },
  { id: "week", label: "أسبوع" },
  { id: "month", label: "شهر" },
  { id: "year", label: "سنة" },
];

export default function ReportsPage() {
  return (
    <DantalPage title="التقارير">
      <OwnerOnly>
        <ReportsContent />
      </OwnerOnly>
    </DantalPage>
  );
}

function ReportsContent() {
  const db = useDbStore((s) => s.db);
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { start, end } = reportRange(period);
  const payments = filterByDateRange(db.payments, start, end);
  const expenses = filterByDateRange(db.expenses, start, end);
  const revenue = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const expenseTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const net = revenue - expenseTotal;
  const topPts = topPatientsByPayments(db, start, end);
  const growth = last6MonthsRevenue(db);
  const chartData = last14DaysChart(db);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...chartData.map((d) => Math.max(d.revenue, d.expense)), 1);
    const barW = w / chartData.length / 2 - 4;
    chartData.forEach((d, i) => {
      const x = (i * w) / chartData.length + 4;
      const revH = (d.revenue / max) * (h - 20);
      const expH = (d.expense / max) * (h - 20);
      ctx.fillStyle = "#10b981";
      ctx.fillRect(x, h - revH, barW, revH);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(x + barW + 2, h - expH, barW, expH);
    });
  }, [chartData]);

  const growthMax = Math.max(...growth.map((x) => x.revenue), 1);

  return (
    <>
      <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h1 className="dantal-title">التقارير</h1>
          <p className="dantal-subtitle mt-2">تحليل الوارد والمصاريف والنمو</p>
        </div>
      </motion.div>

      <div className="mb-6 overflow-x-auto pb-1">
        <Tabs
          tabs={PERIODS.map((p) => ({ id: p.id, label: p.label }))}
          active={period}
          onChange={(id) => setPeriod(id as ReportPeriod)}
          className="min-w-max"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="الوارد" value={fmtMoney(revenue)} icon={TrendingUp} accent="success" />
        <KpiCard label="المصاريف" value={fmtMoney(expenseTotal)} icon={TrendingDown} accent="danger" />
        <KpiCard label="صافي الربح" value={fmtMoney(net)} icon={Wallet} accent={net >= 0 ? "primary" : "warning"} />
        <KpiCard label="المعاملات" value={String(payments.length)} icon={BarChart3} accent="secondary" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>نمو 6 أشهر</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-end justify-between gap-2 overflow-x-auto pb-2">
            {growth.map((g) => {
              const h = Math.round((g.revenue / growthMax) * 100);
              return (
                <div key={g.month} className="flex min-w-[56px] flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-primary transition-all"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted">{g.month.slice(5)}</span>
                  <span className="text-xs text-foreground-secondary">{fmtMoney(g.revenue)}</span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>آخر 14 يوم</CardTitle>
          <p className="text-sm text-muted">أخضر = وارد، أحمر = مصاريف</p>
        </CardHeader>
        <CardBody>
          <canvas ref={canvasRef} width={600} height={180} className="w-full max-w-[600px]" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أعلى المرضى</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {topPts.length === 0 ? (
            <EmptyState icon={Users} title="لا بيانات" description="لا مدفوعات في هذه الفترة" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>المريض</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPts.map(({ patient, total }) => (
                  <TableRow key={patient?.id || total}>
                    <TableCell className="font-semibold">{patient?.name || "—"}</TableCell>
                    <TableCell className="font-semibold text-success">{fmtMoney(total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
}
