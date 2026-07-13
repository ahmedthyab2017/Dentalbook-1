"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Phone, MapPin, Calendar } from "lucide-react";
import { Card, Avatar, Badge } from "@/components/ds";
import type { Patient } from "@/types/db";
import { fmtMoney, fmtDateShort } from "@/lib/format";
import { cn } from "@/lib/cn";

export function DantalPatientCard({
  patient,
  debt,
  lastSession,
}: {
  patient: Patient;
  debt: number;
  lastSession: string | null;
}) {
  const router = useRouter();
  const waPhone = patient.phone?.replace(/[^0-9]/g, "");

  return (
    <div
      role="button"
      tabIndex={0}
      className="group cursor-pointer rounded-[var(--radius-card)] outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={() => router.push(`/patients/${patient.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/patients/${patient.id}`)}
    >
      <Card hover className={cn("flex items-center gap-4 p-4 transition-all hover:border-primary/20")}>
      <Avatar name={patient.name} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-foreground">{patient.name}</h3>
          {debt > 0 && <Badge variant="warning">{fmtMoney(debt)}</Badge>}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {patient.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {patient.phone}
            </span>
          )}
          {patient.age != null && patient.age > 0 && <span>{patient.age} سنة</span>}
        </div>

        {(patient.address || lastSession) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            {patient.address && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {patient.address}
              </span>
            )}
            {lastSession && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                آخر جلسة: {fmtDateShort(lastSession)}
              </span>
            )}
          </div>
        )}
      </div>

      {waPhone && (
        <a
          href={`https://wa.me/${waPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="dantal-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-border bg-surface text-success opacity-0 transition-all group-hover:opacity-100 hover:bg-success-muted hover:border-success/30"
          title="واتساب"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
      </Card>
    </div>
  );
}
