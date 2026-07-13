"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import { Avatar, Badge, Button, IconButton, buttonVariants } from "@/components/ds";
import { cn } from "@/lib/cn";
import { useDbStore } from "@/stores/useDbStore";
import { useQuickFlowStore } from "@/stores/useQuickFlowStore";
import { patientDebt } from "@/lib/patients";
import { fmtMoney } from "@/lib/format";
import type { Patient } from "@/types/db";

const GENDER_LABEL: Record<string, string> = { male: "ذكر", female: "أنثى" };

export function DantalProfileHeader({ patient }: { patient: Patient }) {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const openQf = useQuickFlowStore((s) => s.openWithPatient);
  const debt = patientDebt(db, patient.id);
  const waPhone = patient.phone?.replace(/[^0-9]/g, "");

  return (
    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <IconButton label="رجوع للمرضى" onClick={() => router.push("/patients")}>
          <ArrowRight className="h-5 w-5" />
        </IconButton>
        <Avatar name={patient.name} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="dantal-title">{patient.name}</h1>
            {debt > 0 && <Badge variant="warning">رصيد: {fmtMoney(debt)}</Badge>}
          </div>
          <p className="dantal-subtitle mt-2">
            {[patient.phone, patient.age ? `${patient.age} سنة` : "", patient.gender ? GENDER_LABEL[patient.gender] : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {patient.address && <p className="mt-1 text-sm text-muted">{patient.address}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => openQf(patient.id, patient.name)}>
          <Zap className="h-4 w-4" />
          Quick Flow
        </Button>
        {waPhone && (
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <MessageCircle className="h-4 w-4" />
            واتساب
          </a>
        )}
      </div>
    </div>
  );
}
