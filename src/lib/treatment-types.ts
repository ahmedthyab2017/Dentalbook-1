// Ported from app/app.js:1006-1021 (TREATMENT_TYPES).

export interface TreatmentType {
  id: string;
  ar: string;
  en: string;
  defaultCost: number;
  sessions: number;
}

export const TREATMENT_TYPES: TreatmentType[] = [
  { id: "filling", ar: "حشوة", en: "Filling", defaultCost: 25000, sessions: 1 },
  { id: "extraction", ar: "قلع", en: "Extraction", defaultCost: 25000, sessions: 1 },
  { id: "root_canal", ar: "علاج عصب", en: "Root Canal", defaultCost: 75000, sessions: 2 },
  { id: "cleaning", ar: "تنظيف وتلميع", en: "Cleaning & Polish", defaultCost: 35000, sessions: 1 },
  { id: "crown", ar: "تركيب تاج", en: "Crown", defaultCost: 150000, sessions: 2 },
  { id: "bridge", ar: "جسر", en: "Bridge", defaultCost: 250000, sessions: 3 },
  { id: "implant", ar: "زراعة", en: "Implant", defaultCost: 750000, sessions: 4 },
  { id: "ortho", ar: "تقويم", en: "Orthodontics", defaultCost: 1500000, sessions: 24 },
  { id: "whitening", ar: "تبييض", en: "Whitening", defaultCost: 100000, sessions: 1 },
  { id: "veneer", ar: "فينير (ابتسامة)", en: "Veneer", defaultCost: 200000, sessions: 2 },
  { id: "pediatric", ar: "علاج أطفال", en: "Pediatric", defaultCost: 30000, sessions: 1 },
  { id: "denture", ar: "طقم", en: "Denture", defaultCost: 350000, sessions: 3 },
  { id: "exam", ar: "فحص واستشارة", en: "Examination", defaultCost: 10000, sessions: 1 },
  { id: "other", ar: "أخرى", en: "Other", defaultCost: 0, sessions: 1 },
];

export function treatmentLabel(typeId: string): string {
  const t = TREATMENT_TYPES.find((x) => x.id === typeId);
  return t?.ar || typeId;
}
