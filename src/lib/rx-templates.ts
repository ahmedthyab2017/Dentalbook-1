import type { Lang } from "@/types/session";

export interface RxTemplateMed {
  ar: string;
  en: string;
  dose: string;
  freq: string;
  duration: string;
}

export interface RxTemplate {
  meds: RxTemplateMed[];
  tips: { ar: string; en: string };
}

export const RX_TEMPLATES: Record<string, RxTemplate> = {
  filling: {
    meds: [{ ar: "إيبوبروفين 400ملغم", en: "Ibuprofen 400mg", dose: "1 قرص", freq: "عند الحاجة", duration: "1-2 يوم" }],
    tips: {
      ar: "تجنّب الأطعمة الساخنة/الباردة لـ 24 ساعة. لا تمضغ على الجانب المعالج.",
      en: "Avoid hot/cold foods for 24h. Do not chew on the treated side.",
    },
  },
  extraction: {
    meds: [
      { ar: "إيبوبروفين 400ملغم", en: "Ibuprofen 400mg", dose: "1 قرص", freq: "كل 8 ساعات", duration: "3 أيام" },
      { ar: "أموكسيسيلين 500ملغم", en: "Amoxicillin 500mg", dose: "1 كبسولة", freq: "كل 8 ساعات", duration: "5 أيام" },
    ],
    tips: {
      ar: "اضغط على الشاش 30 دقيقة. لا تبصق بقوة. لا تدخن 48 ساعة.",
      en: "Bite on gauze 30 min. No forceful spitting. No smoking for 48h.",
    },
  },
  root_canal: {
    meds: [{ ar: "إيبوبروفين 400ملغم", en: "Ibuprofen 400mg", dose: "1 قرص", freq: "كل 8 ساعات", duration: "3 أيام" }],
    tips: { ar: "تجنّب المضغ على السن حتى التاج النهائي.", en: "Avoid chewing on the tooth until final crown." },
  },
  implant: {
    meds: [
      { ar: "أموكسيسيلين 500ملغم", en: "Amoxicillin 500mg", dose: "1 كبسولة", freq: "كل 8 ساعات", duration: "5 أيام" },
      { ar: "كلورهكسيدين غسول", en: "Chlorhexidine MW", dose: "15مل", freq: "مرتين يومياً", duration: "7 أيام" },
    ],
    tips: { ar: "لا تدخن. نظافة فم دقيقة حول الزرعة.", en: "No smoking. Meticulous oral hygiene around implant." },
  },
  ortho: {
    meds: [{ ar: "باراسيتامول 500ملغم", en: "Paracetamol 500mg", dose: "1-2 قرص", freq: "عند الحاجة", duration: "3 أيام" }],
    tips: { ar: "تجنّب الأطعمة الصلبة اللزجة. نظّف حول الأسلاك.", en: "Avoid hard/sticky foods. Clean around brackets." },
  },
  crown: {
    meds: [{ ar: "إيبوبروفين 400ملغم", en: "Ibuprofen 400mg", dose: "1 قرص", freq: "عند الحاجة", duration: "2 أيام" }],
    tips: { ar: "تجنّب المضغ على التاج المؤقت.", en: "Avoid chewing on temporary crown." },
  },
  other: {
    meds: [{ ar: "باراسيتامول 500ملغم", en: "Paracetamol 500mg", dose: "1 قرص", freq: "عند الحاجة", duration: "3 أيام" }],
    tips: { ar: "اتبع تعليمات الطبيب.", en: "Follow dentist instructions." },
  },
};

RX_TEMPLATES.bridge = RX_TEMPLATES.crown;

export const SEED_MEDS = [
  { ar: "أموكسيسيلين 500ملغم", en: "Amoxicillin 500mg", dose: "1 كبسولة", freq: "كل 8 ساعات", duration: "5 أيام" },
  { ar: "إيبوبروفين 400ملغم", en: "Ibuprofen 400mg", dose: "1 قرص", freq: "كل 8 ساعات", duration: "3 أيام" },
  { ar: "باراسيتامول 500ملغم", en: "Paracetamol 500mg", dose: "1-2 قرص", freq: "عند الحاجة", duration: "3-5 أيام" },
  { ar: "كلورهكسيدين غسول", en: "Chlorhexidine MW", dose: "15مل", freq: "مرتين يومياً", duration: "7 أيام" },
];

export function rxTemplateFor(typeId: string, lang: Lang) {
  const tpl = RX_TEMPLATES[typeId] || RX_TEMPLATES.other;
  return {
    meds: tpl.meds.map((m) => ({
      name: lang === "en" ? m.en : m.ar,
      dose: m.dose,
      freq: m.freq,
      duration: m.duration,
    })),
    tips: lang === "en" ? tpl.tips.en : tpl.tips.ar,
  };
}
