// Ported from app/app.js:1759-1838 (NAV_MAP, SECRETARY_PAGES, TIER_ROLES,
// TIER_LABELS). Icons are intentionally left out here — Sidebar maps id -> <Icon/>.

import type { NavMap, NavSide } from "@/types/nav";
import type { LicenseTier } from "@/types/db";
import type { Role } from "@/types/session";

export const NAV_MAP: Record<NavSide, NavMap> = {
  staff: {
    main: [{ id: "dashboard", ar: "لوحة التحكم", en: "Dashboard" }],
    clinical: [
      { id: "patients", ar: "المرضى", en: "Patients" },
      { id: "appointments", ar: "المواعيد", en: "Appointments" },
      { id: "plans", ar: "خطط العلاج", en: "Treatment Plans" },
      { id: "cases", ar: "توثيق الحالات", en: "Case Documentation" },
      { id: "prescriptions", ar: "الوصفات", en: "Prescriptions" },
      { id: "tasks", ar: "المهام", en: "Tasks" },
    ],
    financial: [
      { id: "finance", ar: "المالية", en: "Finance", ownerOnly: true },
      { id: "reports", ar: "التقارير", en: "Reports", ownerOnly: true },
      { id: "insights", ar: "مؤشرات الأداء", en: "Insights", ownerOnly: true },
      { id: "recall", ar: "المتابعة والتذكير", en: "Recall & Reminders", ownerOnly: true },
    ],
    mgmt: [
      { id: "staff", ar: "الكادر", en: "Staff", ownerOnly: true },
      { id: "services", ar: "قائمة الخدمات", en: "Services", ownerOnly: true },
      { id: "inventory", ar: "المخزون", en: "Inventory" },
      { id: "vendors", ar: "جهات نتعامل معها", en: "Contacts" },
    ],
    other: [
      { id: "backup", ar: "النسخ الاحتياطي", en: "Backup", ownerOnly: true },
      { id: "settings", ar: "الإعدادات", en: "Settings" },
      { id: "about", ar: "عن التطبيق", en: "About" },
    ],
  },
  patient: {
    main: [
      { id: "myfile", ar: "ملفي الطبي", en: "My File" },
      { id: "myappts", ar: "مواعيدي", en: "My Appointments" },
      { id: "myrx", ar: "وصفاتي", en: "My Prescriptions" },
    ],
    clinical: [],
    financial: [],
    mgmt: [],
    other: [
      { id: "settings", ar: "الإعدادات", en: "Settings" },
      { id: "about", ar: "عن التطبيق", en: "About" },
    ],
  },
};

export const SECRETARY_PAGES = [
  "dashboard",
  "appointments",
  "patients",
  "profile",
  "vendors",
  "settings",
  "about",
];

export const TIER_ROLES: Record<LicenseTier, Role[]> = {
  solo: ["owner"],
  duo: ["owner", "secretary"],
  clinic: ["owner", "doctor", "secretary"],
};

export const TIER_LABELS: Record<LicenseTier, { ar: string; en: string }> = {
  solo: { ar: "طبيب منفرد", en: "Solo Doctor" },
  duo: { ar: "طبيب + سكرتير", en: "Doctor + Secretary" },
  clinic: { ar: "عيادة (مدير + أطباء)", en: "Clinic (Manager + Doctors)" },
};

/**
 * Pages that have a real Next.js route so far (Phase 0/1 only covers
 * Dashboard + Patients). Everything else in NAV_MAP is hidden from the
 * sidebar until its phase lands — see web/MIGRATION_NOTES.md.
 */
export const IMPLEMENTED_PAGES = new Set([
  "dashboard",
  "patients",
  "appointments",
  "plans",
  "cases",
  "prescriptions",
  "tasks",
  "finance",
  "reports",
  "insights",
  "recall",
  "staff",
  "services",
  "inventory",
  "vendors",
  "backup",
  "settings",
  "about",
  "myfile",
  "myappts",
  "myrx",
]);

export const TEST_LOGIN_EMAIL = "admin";
export const TEST_LOGIN_PASSWORD = "admin123";
