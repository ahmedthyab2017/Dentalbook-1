import { Cloud } from "@/lib/cloud";
import { ClinicApi } from "@/lib/clinic-api";
import { createDefaultDb } from "@/lib/default-db";
import type { CloudSyncConfig, DentistDb } from "@/types/db";

export function isBackendEnabled(): boolean {
  return Cloud.configured();
}

export function isBackendAuthed(): boolean {
  return isBackendEnabled() && Cloud.loggedIn();
}

export function mergeExportedDb(
  raw: Record<string, unknown>,
  preserveCloud?: CloudSyncConfig
): DentistDb {
  const base = createDefaultDb();
  const rawMeta = (raw.meta as Partial<DentistDb["meta"]>) || {};

  const meta: DentistDb["meta"] = {
    ...base.meta,
    ...rawMeta,
    cloud: {
      ...base.meta.cloud,
      ...rawMeta.cloud,
      ...preserveCloud,
      apiUrl: preserveCloud?.apiUrl || Cloud.base() || base.meta.cloud.apiUrl,
    },
  };

  return {
    meta,
    patients: (raw.patients as DentistDb["patients"]) ?? [],
    appointments: (raw.appointments as DentistDb["appointments"]) ?? [],
    staff: (raw.staff as DentistDb["staff"])?.length ? (raw.staff as DentistDb["staff"]) : base.staff,
    plans: (raw.plans as DentistDb["plans"]) ?? [],
    prescriptions: (raw.prescriptions as DentistDb["prescriptions"]) ?? [],
    payments: (raw.payments as DentistDb["payments"]) ?? [],
    expenses: (raw.expenses as DentistDb["expenses"]) ?? [],
    vendors: (raw.vendors as DentistDb["vendors"]) ?? [],
    inventory: (raw.inventory as DentistDb["inventory"]) ?? [],
    services: (raw.services as DentistDb["services"]) ?? [],
    cases: (raw.cases as DentistDb["cases"]) ?? [],
    reminders: (raw.reminders as DentistDb["reminders"]) ?? [],
    voiceNotes: (raw.voiceNotes as DentistDb["voiceNotes"]) ?? [],
    auditLog: (raw.auditLog as DentistDb["auditLog"]) ?? [],
    settlements: (raw.settlements as DentistDb["settlements"]) ?? [],
    archives: (raw.archives as DentistDb["archives"]) ?? [],
    referrals: (raw.referrals as DentistDb["referrals"]) ?? [],
  };
}

export async function pullFromBackend(preserveCloud?: CloudSyncConfig): Promise<DentistDb | null> {
  if (!isBackendAuthed()) return null;
  const exported = await ClinicApi.exportAll();
  return mergeExportedDb(exported, preserveCloud);
}

export async function pushToBackend(db: DentistDb): Promise<void> {
  if (!isBackendAuthed()) return;
  await ClinicApi.importAll(db);
}

export function apiErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return "فشل الاتصال بالخادم";
}
