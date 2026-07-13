import type { DentistDb } from "@/types/db";
import { TREATMENT_TYPES } from "@/lib/treatment-types";

export interface QfTreatmentOption {
  id: string;
  name: string;
  cost: number;
  sessions: number;
}

export function qfTreatmentOptions(db: DentistDb, lang: "ar" | "en" = "ar"): QfTreatmentOption[] {
  if (db.services?.length) {
    return db.services.map((s) => ({
      id: s.id,
      name: (lang === "en" ? s.nameEn : s.nameAr) || s.name || s.id,
      cost: Number(s.price ?? s.defaultCost) || 0,
      sessions: Number(s.sessions) || 1,
    }));
  }
  return TREATMENT_TYPES.map((t) => ({
    id: t.id,
    name: lang === "en" ? t.en : t.ar,
    cost: t.defaultCost,
    sessions: t.sessions,
  }));
}
