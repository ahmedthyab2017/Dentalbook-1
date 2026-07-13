import type { Lang } from "@/types/session";

export function todayStr(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function fmtMoney(n: number | undefined | null, lang: Lang = "ar"): string {
  const v = Number(n || 0);
  const s = v.toLocaleString(lang === "en" ? "en-US" : "ar-IQ", {
    maximumFractionDigits: 0,
  });
  return lang === "en" ? `${s} IQD` : `${s} د.ع`;
}

export function fmtDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export function initials(name: string | undefined | null): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[1][0];
}

export function greeting(lang: Lang = "ar"): string {
  const h = new Date().getHours();
  if (lang === "en") {
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }
  if (h < 12) return "صباح الخير";
  if (h < 18) return "مساء الخير";
  return "مساء الخير";
}
