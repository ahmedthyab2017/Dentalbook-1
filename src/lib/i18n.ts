import type { Lang } from "@/types/session";

const STRINGS: Record<string, { ar: string; en: string }> = {
  patient: { ar: "المريض", en: "Patient" },
  age: { ar: "العمر", en: "Age" },
  date: { ar: "التاريخ", en: "Date" },
  notes: { ar: "ملاحظات", en: "Notes" },
  signature: { ar: "التوقيع", en: "Signature" },
  saved: { ar: "تم الحفظ", en: "Saved" },
  deleted: { ar: "تم الحذف", en: "Deleted" },
  male: { ar: "ذكر", en: "Male" },
  female: { ar: "أنثى", en: "Female" },
};

export function T(key: string, lang: Lang = "ar"): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return lang === "en" ? entry.en : entry.ar;
}

export function L(ar: string, en: string, lang: Lang): string {
  return lang === "en" ? en : ar;
}

export function applyLangToDocument(lang: Lang, theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.setAttribute("data-lang", lang);
  document.body.setAttribute("data-theme", theme);
}
