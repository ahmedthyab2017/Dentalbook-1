import type { Appointment, AppointmentStatus } from "@/types/db";
import { todayStr } from "@/lib/format";

export const APPT_STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: "badge-info",
  confirmed: "badge-success",
  completed: "badge-success",
  cancelled: "badge-error",
  "no-show": "badge-warn",
};

export const APPT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "منجز",
  cancelled: "ملغى",
  "no-show": "لم يحضر",
};

export type ApptStatusFilter = "all" | AppointmentStatus;

export function filterAppointments(
  appointments: Appointment[],
  opts: { date: string; upcoming: boolean; statusFilter: ApptStatusFilter }
): Appointment[] {
  const today = todayStr();
  let list = opts.upcoming
    ? appointments.filter((a) => (a.date || "") >= today)
    : appointments.filter((a) => a.date === opts.date);

  if (opts.statusFilter !== "all") {
    list = list.filter((a) => a.status === opts.statusFilter);
  }

  return list.sort((a, b) =>
    opts.upcoming
      ? `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      : (a.time || "").localeCompare(b.time || "")
  );
}
