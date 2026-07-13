"use client";

import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { Card, Badge, IconButton, Avatar } from "@/components/ds";
import type { Appointment, AppointmentStatus } from "@/types/db";
import { APPT_STATUS_LABEL } from "@/lib/appointments-utils";
import { fmtDateShort } from "@/lib/format";
import { cn } from "@/lib/cn";

const STATUS_VARIANT: Record<
  AppointmentStatus,
  "default" | "primary" | "success" | "warning" | "danger"
> = {
  scheduled: "primary",
  confirmed: "success",
  completed: "success",
  cancelled: "danger",
  "no-show": "warning",
};

const STATUS_STRIPE: Record<AppointmentStatus, string> = {
  scheduled: "from-primary to-primary/60",
  confirmed: "from-success to-emerald-400",
  completed: "from-slate-400 to-slate-300",
  cancelled: "from-danger to-rose-400",
  "no-show": "from-warning to-amber-400",
};

export function DantalApptCard({
  appointment,
  patientName,
  showDate,
  onComplete,
  onCancel,
  onEdit,
}: {
  appointment: Appointment;
  patientName: string;
  showDate?: boolean;
  onComplete: () => void;
  onCancel: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();

  return (
    <Card
      hover
      className="group relative overflow-hidden p-0"
    >
      <div
        className={cn(
          "absolute inset-y-0 start-0 w-1 bg-gradient-to-b",
          STATUS_STRIPE[appointment.status]
        )}
        aria-hidden
      />
      <div className="flex items-center gap-4 p-4 ps-5">
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-[14px] bg-primary-muted/60 px-2 py-2.5">
          {showDate && (
            <div className="mb-0.5 text-[10px] font-semibold text-muted">{fmtDateShort(appointment.date)}</div>
          )}
          <div className="text-lg font-extrabold tabular-nums text-primary">{appointment.time || "--:--"}</div>
        </div>

        <Avatar name={patientName} size="md" className="hidden shrink-0 sm:flex" />

        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => router.push(`/patients/${appointment.ptId}`)}
        >
          <div className="truncate text-base font-bold text-foreground">{patientName}</div>
          <div className="mt-0.5 truncate text-sm text-muted">
            {appointment.purpose || appointment.note || "—"}
          </div>
        </div>

        <Badge variant={STATUS_VARIANT[appointment.status]} className="hidden shrink-0 sm:inline-flex">
          {APPT_STATUS_LABEL[appointment.status]}
        </Badge>

        <div className="flex shrink-0 items-center gap-0.5 opacity-90 transition-opacity group-hover:opacity-100">
          <IconButton label="تعيين كمنجز" onClick={onComplete} className="hover:bg-success-muted">
            <Check className="h-4 w-4 text-success" />
          </IconButton>
          <IconButton label="إلغاء" variant="danger" onClick={onCancel}>
            <X className="h-4 w-4" />
          </IconButton>
          <IconButton label="تعديل" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
