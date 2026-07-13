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

const API_ERROR_AR: Record<string, string> = {
  UNAUTHORIZED: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  EMAIL_TAKEN: "هذا البريد مستخدم مسبقاً — جرّب بريداً آخر",
  LICENSE_INVALID: "مفتاح الترخيص غير صالح — اتركه فارغاً أو استخدم DANTAL-DEV-CLINIC",
  LICENSE_UNAVAILABLE: "مفتاح الترخيص منتهٍ أو مستنفد",
  FORBIDDEN: "هذا القسم لمدير المنصة فقط — سجّل دخولك بحساب مدير النظام",
};

export function isPlatformForbidden(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const body = err as { errors?: string[]; message?: string };
  if (body.errors?.includes("FORBIDDEN")) return true;
  return /access denied/i.test(body.message || "");
}

export function redirectToPlatformLogin(router: { replace: (url: string) => void }) {
  Cloud.logout();
  router.replace("/login?reason=platform");
}

export function apiErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "فشل الاتصال بالخادم";

  const body = err as {
    message?: string;
    errors?: string[];
    code?: string;
  };

  const code = body.errors?.[0] || body.code;
  if (code && API_ERROR_AR[code]) return API_ERROR_AR[code];

  const raw = body.message?.trim() || "";
  if (/invalid email or password/i.test(raw)) return API_ERROR_AR.UNAUTHORIZED;
  if (/email is already registered/i.test(raw)) return API_ERROR_AR.EMAIL_TAKEN;
  if (/invalid license key/i.test(raw)) return API_ERROR_AR.LICENSE_INVALID;
  if (/temporarily locked/i.test(raw)) return "الحساب مقفول مؤقتاً بسبب محاولات خاطئة — انتظر 15 دقيقة";
  if (/account is disabled/i.test(raw)) return "الحساب معطّل — تواصل مع مدير المنصة";
  if (/validation failed/i.test(raw) && body.errors?.length) {
    return "تحقق من البيانات: " + body.errors.join(" · ");
  }
  if (raw) return raw;

  return "فشل الاتصال بالخادم";
}
