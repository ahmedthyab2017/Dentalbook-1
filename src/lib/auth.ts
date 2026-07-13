// Pure auth-flow helpers ported from app/app.js:1988-2115 (tryEmailLogin,
// selectRole, tryLogin). Kept side-effect-free so components stay thin.

import type { DentistDb } from "@/types/db";
import type { Role, SessionUser } from "@/types/session";
import { TEST_LOGIN_EMAIL, TEST_LOGIN_PASSWORD, TIER_ROLES } from "./constants";
import { uid } from "./id";

export function validateEmailLogin(email: string, password: string): boolean {
  return email === TEST_LOGIN_EMAIL && password === TEST_LOGIN_PASSWORD;
}

export function tierForDb(db: DentistDb) {
  const t = db.meta?.license?.tier;
  return TIER_ROLES[t] ? t : "clinic";
}

export function rolesAllowedByTier(db: DentistDb): Role[] {
  return TIER_ROLES[tierForDb(db)] ?? TIER_ROLES.clinic;
}

/** `doctor` role needs a name field in addition to the PIN; others are PIN-only. */
export function roleNeedsName(role: Role): boolean {
  return role === "doctor" || role === "patient";
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  user?: SessionUser;
  /** Set when a new patient record had to be created (role === 'patient'). */
  newPatient?: DentistDb["patients"][number];
}

export function attemptRoleLogin(
  db: DentistDb,
  role: Role,
  { name, pin }: { name: string; pin: string }
): LoginResult {
  if (role !== "patient" && !rolesAllowedByTier(db).includes(role)) {
    return { ok: false, error: "هذا الدور غير مشمول في ترخيصك" };
  }

  if (role === "owner") {
    const ownerPin = db.meta.pins?.owner || db.meta.ownerPin || "1234";
    if (pin !== ownerPin) return { ok: false, error: "رمز غير صحيح" };
    return { ok: true, user: { id: "owner", name: db.meta.doctorName || "المدير", role: "owner" } };
  }
  if (role === "reception") {
    const recPin = db.meta.pins?.reception || db.meta.receptionPin || "5678";
    if (pin !== recPin) return { ok: false, error: "رمز غير صحيح" };
    return { ok: true, user: { id: "reception", name: "الاستقبال", role: "reception" } };
  }
  if (role === "secretary") {
    const secPin = db.meta.pins?.secretary || db.meta.secretaryPin || "4321";
    if (pin !== secPin) return { ok: false, error: "رمز غير صحيح" };
    return { ok: true, user: { id: "secretary", name: "السكرتير", role: "secretary" } };
  }
  if (role === "doctor") {
    if (!name) return { ok: false, error: "الرجاء تعبئة كل الحقول" };
    if (!pin) return { ok: false, error: "رمز غير صحيح" };
    const nm = name.trim().toLowerCase();
    const found = db.staff.find(
      (s) =>
        (s.role === "doctor" || s.role === "owner") &&
        (s.name || "").trim().toLowerCase() === nm &&
        !!s.pin &&
        s.pin === pin
    );
    if (!found) return { ok: false, error: "رمز غير صحيح" };
    return { ok: true, user: { id: found.id, name: found.name, role: "doctor", staffId: found.id } };
  }
  if (role === "patient") {
    if (!name) return { ok: false, error: "الرجاء تعبئة كل الحقول" };
    let pt = db.patients.find(
      (p) => (p.name && p.name.toLowerCase() === name.toLowerCase()) || (p.phone && p.phone === name)
    );
    if (!pt) {
      pt = { id: uid("pt_"), name, phone: "", createdAt: Date.now(), chart: {} };
      return {
        ok: true,
        user: { id: pt.id, name: pt.name, role: "patient", ptId: pt.id },
        newPatient: pt,
      };
    }
    return { ok: true, user: { id: pt.id, name: pt.name, role: "patient", ptId: pt.id } };
  }
  return { ok: false, error: "دور غير معروف" };
}
