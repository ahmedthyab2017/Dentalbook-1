"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DantalPage } from "@/components/layout/DantalPage";
import { DantalDashboardKpis } from "@/components/dashboard/DantalDashboardKpis";
import { DantalTodaySchedule, DantalRecentPatients } from "@/components/dashboard/DantalDashboardPanels";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Card, CardHeader, CardTitle, CardBody, Button } from "@/components/ds";
import { useSessionStore } from "@/stores/useSessionStore";
import { useQuickFlowStore } from "@/stores/useQuickFlowStore";
import { greeting } from "@/lib/format";
import { slideUp } from "@/lib/motion";
import { BarChart3, CalendarPlus, Sparkles, UserPlus, Zap } from "lucide-react";

const DAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function DashboardPage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const openQf = useQuickFlowStore((s) => s.openBlank);

  if (!user) return null;

  const isOwner = user.role === "owner";
  const today = new Date();

  return (
    <DantalPage title="لوحة التحكم">
      <motion.div className="dantal-hero-banner mb-8" {...slideUp}>
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Dantal · لوحة التحكم
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {greeting()}
              {user.name ? `، ${user.name}` : ""}
            </h1>
            <p className="mt-2 text-sm text-white/75 md:text-base">
              {DAY_AR[today.getDay()]} · {today.toLocaleDateString("ar-IQ", { dateStyle: "long" })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              className="border-white/20 bg-white/95 text-primary shadow-lg hover:bg-white"
              onClick={() => openQf()}
            >
              <Zap className="h-4 w-4" />
              Quick Flow
            </Button>
            <Button
              variant="secondary"
              className="border-white/20 bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
              onClick={() => router.push("/appointments")}
            >
              <CalendarPlus className="h-4 w-4" />
              موعد
            </Button>
            <Button
              className="border-white/20 shadow-lg"
              onClick={() => router.push("/patients")}
            >
              <UserPlus className="h-4 w-4" />
              مريض جديد
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="mb-8">
        <DantalDashboardKpis user={user} />
      </div>

      <div className="mb-8 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <DantalTodaySchedule />
        <DantalRecentPatients />
      </div>

      {isOwner && (
        <motion.div {...slideUp} transition={{ delay: 0.1 }}>
          <Card hover className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border-subtle bg-gradient-to-l from-primary-muted/30 to-transparent">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-success-muted to-success/10">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>الإيرادات — آخر 7 أيام</CardTitle>
                <p className="mt-0.5 text-xs text-muted">مقارنة يومية للمدفوعات</p>
              </div>
            </CardHeader>
            <CardBody className="pt-4">
              <div className="dantal-chart">
                <RevenueChart />
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </DantalPage>
  );
}
