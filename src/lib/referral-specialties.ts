import type { Lang } from "@/types/session";
import { L } from "@/lib/i18n";

export const REFERRAL_SPECIALTIES = [
  { k: "ortho", ar: "تقويم الأسنان", en: "Orthodontics" },
  { k: "perio", ar: "أمراض اللثة", en: "Periodontics" },
  { k: "endo", ar: "علاج الجذور", en: "Endodontics" },
  { k: "oral_surgery", ar: "جراحة الفم", en: "Oral Surgery" },
  { k: "prosth", ar: "تركيبات الأسنان", en: "Prosthodontics" },
  { k: "pedo", ar: "أسنان الأطفال", en: "Pediatric Dentistry" },
  { k: "radiology", ar: "أشعة", en: "Radiology" },
  { k: "general", ar: "طب عام", en: "General Medicine" },
];

export function specialtyLabel(k: string, lang: Lang): string {
  const s = REFERRAL_SPECIALTIES.find((x) => x.k === k);
  if (!s) return k;
  return L(s.ar, s.en, lang);
}
