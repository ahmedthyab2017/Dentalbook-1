"use client";

import { motion } from "framer-motion";
import { Bell, CalendarClock, MessageCircle, Wallet } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import { buttonVariants, Card, CardBody, CardHeader, CardTitle, EmptyState } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { fmtDateShort, fmtMoney } from "@/lib/format";
import { patientDebt } from "@/lib/patients";
import { waLink } from "@/lib/wa";
import { slideUp } from "@/lib/motion";
import { cn } from "@/lib/cn";

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function lastVisitOf(
  db: ReturnType<typeof useDbStore.getState>["db"],
  ptId: string
): string | null {
  let latest: string | null = null;
  for (const a of db.appointments) {
    if (a.ptId === ptId && a.status === "completed" && a.date) {
      if (!latest || a.date > latest) latest = a.date;
    }
  }
  for (const p of db.payments) {
    if (p.ptId === ptId && p.date) {
      if (!latest || p.date > latest) latest = p.date;
    }
  }
  return latest;
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

export default function RecallPage() {
  return (
    <DantalPage title="المتابعة والتذكير">
      <OwnerOnly>
        <RecallContent />
      </OwnerOnly>
    </DantalPage>
  );
}

function RecallContent() {
  const db = useDbStore((s) => s.db);
  const clinic = db.meta.clinicName || "العيادة";
  const tomorrow = tomorrowStr();
  const sixMonthsAgo = monthsAgo(6);

  const tomorrowReminders = db.appointments
    .filter((a) => a.date === tomorrow && a.status === "confirmed")
    .map((a) => {
      const pt = db.patients.find((p) => p.id === a.ptId);
      return pt?.phone ? { pt, appt: a } : null;
    })
    .filter(Boolean) as { pt: (typeof db.patients)[0]; appt: (typeof db.appointments)[0] }[];

  const recallList = db.patients
    .filter((p) => p.phone)
    .map((p) => ({ pt: p, last: lastVisitOf(db, p.id) }))
    .filter((x) => !x.last || x.last < sixMonthsAgo)
    .sort((a, b) => (a.last || "").localeCompare(b.last || ""))
    .slice(0, 50);

  const debtors = db.patients
    .filter((p) => p.phone)
    .map((p) => ({ pt: p, debt: patientDebt(db, p.id) }))
    .filter((x) => x.debt > 0)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 50);

  return (
    <>
      <motion.div className="mb-8" {...slideUp}>
        <h1 className="dantal-title">المتابعة والتذكير</h1>
        <p className="dantal-subtitle mt-2">
          روابط واتساب للمراجعة قبل الإرسال — لا يتم الإرسال تلقائياً
        </p>
      </motion.div>

      <RecallSection icon={CalendarClock} title="تذكيرات الغد">
        {tomorrowReminders.length === 0 ? (
          <EmptyState icon={Bell} title="لا تذكيرات للغد" />
        ) : (
          <div className="divide-y divide-border">
            {tomorrowReminders.map(({ pt, appt }) => (
              <RecallRow
                key={appt.id}
                name={pt.name}
                sub={`${appt.time || ""} — ${appt.purpose || ""}`}
                wa={waLink(
                  pt.phone!,
                  `مرحباً ${pt.name}، نذكّرك بموعدك غداً ${appt.time || ""} في ${clinic}.`
                )}
              />
            ))}
          </div>
        )}
      </RecallSection>

      <RecallSection icon={Bell} title="متابعة (6+ أشهر)">
        {recallList.length === 0 ? (
          <EmptyState icon={Bell} title="لا مرضى للمتابعة" />
        ) : (
          <div className="divide-y divide-border">
            {recallList.map(({ pt, last }) => (
              <RecallRow
                key={pt.id}
                name={pt.name}
                sub={`آخر زيارة: ${last ? fmtDateShort(last) : "لم يسبق"}`}
                wa={waLink(
                  pt.phone!,
                  `مرحباً ${pt.name}، آخر زيارتك ${last ? fmtDateShort(last) : "منذ فترة"}. نود دعوتك لفحص دوري في ${clinic}.`
                )}
              />
            ))}
          </div>
        )}
      </RecallSection>

      <RecallSection icon={Wallet} title="تذكير بالرصيد">
        {debtors.length === 0 ? (
          <EmptyState icon={Wallet} title="لا مديونين" />
        ) : (
          <div className="divide-y divide-border">
            {debtors.map(({ pt, debt }) => (
              <RecallRow
                key={pt.id}
                name={pt.name}
                sub={`الرصيد: ${fmtMoney(debt)}`}
                wa={waLink(
                  pt.phone!,
                  `مرحباً ${pt.name}، لديك رصيد متبقي ${debt.toLocaleString()} د.ع في ${clinic}.`
                )}
              />
            ))}
          </div>
        )}
      </RecallSection>
    </>
  );
}

function RecallSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardBody className="p-0">{children}</CardBody>
    </Card>
  );
}

function RecallRow({ name, sub, wa }: { name: string; sub: string; wa: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 text-sm text-muted">{sub}</p>
      </div>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ size: "sm" }))}
      >
        <MessageCircle className="h-4 w-4" />
        واتساب
      </a>
    </div>
  );
}
