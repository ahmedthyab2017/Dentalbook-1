import type { ToothState } from "@/types/db";

// Ported from _toothStates()/_toothStateLabel() (app/app.js:3663-3666), extended
// with implant + planned-extraction states for the premium chart redesign.
export const TOOTH_STATES: ToothState[] = [
  "healthy",
  "decay",
  "filling",
  "rct",
  "crown",
  "implant",
  "missing",
  "extraction",
];

export const TOOTH_STATE_LABEL_AR: Record<ToothState, string> = {
  healthy: "سليم",
  decay: "تسوس",
  filling: "حشوة",
  rct: "علاج عصب",
  crown: "تلبيسة",
  implant: "زراعة",
  missing: "مفقود",
  extraction: "خلع مخطط",
};

export const TOOTH_STATE_LABEL_EN: Record<ToothState, string> = {
  healthy: "Healthy",
  decay: "Caries",
  filling: "Filling",
  rct: "Root Canal",
  crown: "Crown",
  implant: "Implant",
  missing: "Missing",
  extraction: "Extraction Planned",
};

/** Hex swatch shown in legends/status pickers for each tooth state. */
export const TOOTH_STATE_COLOR: Record<ToothState, string> = {
  healthy: "#ffffff",
  decay: "#ef4444",
  filling: "#3b82f6",
  rct: "#f97316",
  crown: "#d4af37",
  implant: "#a855f7",
  missing: "#94a3b8",
  extraction: "#7f1d1d",
};

export type Dentition = "permanent" | "deciduous";
export type ToothType = "central" | "lateral" | "canine" | "premolar" | "molar";

/**
 * Fine-grained anatomical category — drives which SVG morphology (crown
 * shape, cusp count, root count) is rendered for a given tooth number.
 */
export type ToothCategory =
  | "central"
  | "lateral"
  | "canine"
  | "premolar1"
  | "premolar2"
  | "molar1"
  | "molar2"
  | "molar3"
  | "dcCentral"
  | "dcLateral"
  | "dcCanine"
  | "dcMolar1"
  | "dcMolar2";

export type Jaw = "upper" | "lower";
export type Side = "right" | "left";

/** Permanent — each quadrant: 1 central, 1 lateral, 1 canine, 2 premolar, 3 molar (8 teeth). */
export const PERM_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const PERM_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const PERM_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
export const PERM_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

/** Deciduous — each quadrant: 1 central, 1 lateral, 1 canine, 2 molar (5 teeth). */
export const DECID_UPPER_RIGHT = [55, 54, 53, 52, 51];
export const DECID_UPPER_LEFT = [61, 62, 63, 64, 65];
export const DECID_LOWER_LEFT = [71, 72, 73, 74, 75];
export const DECID_LOWER_RIGHT = [85, 84, 83, 82, 81];

/** @deprecated Use PERM_* constants */
export const UPPER_RIGHT = PERM_UPPER_RIGHT;
/** @deprecated Use PERM_* constants */
export const UPPER_LEFT = PERM_UPPER_LEFT;
/** @deprecated Use PERM_* constants */
export const LOWER_RIGHT = PERM_LOWER_RIGHT;
/** @deprecated Use PERM_* constants */
export const LOWER_LEFT = PERM_LOWER_LEFT;

export const DENTITION_LABELS: Record<Dentition, { ar: string; en: string }> = {
  permanent: { ar: "الأسنان الدائمة", en: "Permanent" },
  deciduous: { ar: "الأسنان اللبنية", en: "Deciduous" },
};

export const TOOTH_TYPE_LABELS: Record<ToothType, { ar: string; en: string }> = {
  central: { ar: "قاطع مركزي", en: "Central" },
  lateral: { ar: "قاطع جانبي", en: "Lateral" },
  canine: { ar: "ناب", en: "Canine" },
  premolar: { ar: "ضاحك", en: "Premolar" },
  molar: { ar: "طاحن", en: "Molar" },
};

export function isDeciduousTooth(num: number): boolean {
  const quadrant = Math.floor(num / 10);
  return quadrant >= 5 && quadrant <= 8;
}

/** Quadrant 1-8 (FDI). */
export function getQuadrant(num: number): number {
  return Math.floor(num / 10);
}

export function getToothJaw(num: number): Jaw {
  const q = getQuadrant(num);
  return q === 1 || q === 2 || q === 5 || q === 6 ? "upper" : "lower";
}

/** Patient's anatomical right/left (quadrants 1/4/5/8 = right, 2/3/6/7 = left). */
export function getToothSide(num: number): Side {
  const q = getQuadrant(num);
  return q === 1 || q === 4 || q === 5 || q === 8 ? "right" : "left";
}

export function getToothType(num: number): ToothType {
  const pos = num % 10;
  if (pos === 1) return "central";
  if (pos === 2) return "lateral";
  if (pos === 3) return "canine";
  if (pos === 4 || pos === 5) return isDeciduousTooth(num) ? "molar" : "premolar";
  return "molar";
}

/** Fine-grained morphology category used by the anatomical SVG renderer. */
export function getToothCategory(num: number): ToothCategory {
  const pos = num % 10;
  const deciduous = isDeciduousTooth(num);
  if (deciduous) {
    if (pos === 1) return "dcCentral";
    if (pos === 2) return "dcLateral";
    if (pos === 3) return "dcCanine";
    if (pos === 4) return "dcMolar1";
    return "dcMolar2";
  }
  if (pos === 1) return "central";
  if (pos === 2) return "lateral";
  if (pos === 3) return "canine";
  if (pos === 4) return "premolar1";
  if (pos === 5) return "premolar2";
  if (pos === 6) return "molar1";
  if (pos === 7) return "molar2";
  return "molar3";
}

/** Anatomically-typical root count for a tooth (upper molars: 3, lower molars: 2, etc). */
export function getRootCount(num: number): number {
  const category = getToothCategory(num);
  const jaw = getToothJaw(num);
  switch (category) {
    case "central":
    case "lateral":
    case "canine":
    case "dcCentral":
    case "dcLateral":
    case "dcCanine":
      return 1;
    case "premolar1":
      return jaw === "upper" ? 2 : 1;
    case "premolar2":
      return 1;
    case "molar1":
    case "molar2":
      return jaw === "upper" ? 3 : 2;
    case "molar3":
      // Third molars are highly variable — often fused into fewer roots.
      return jaw === "upper" ? 2 : 2;
    case "dcMolar1":
    case "dcMolar2":
      return jaw === "upper" ? 3 : 2;
    default:
      return 1;
  }
}

const TOOTH_NAME_AR: Record<ToothCategory, string> = {
  central: "قاطعة مركزية",
  lateral: "قاطعة جانبية",
  canine: "ناب",
  premolar1: "ضاحك أول",
  premolar2: "ضاحك ثاني",
  molar1: "رحى أولى",
  molar2: "رحى ثانية",
  molar3: "رحى ثالثة (العقل)",
  dcCentral: "قاطعة مركزية لبنية",
  dcLateral: "قاطعة جانبية لبنية",
  dcCanine: "ناب لبني",
  dcMolar1: "رحى لبنية أولى",
  dcMolar2: "رحى لبنية ثانية",
};

const TOOTH_NAME_EN: Record<ToothCategory, string> = {
  central: "Central Incisor",
  lateral: "Lateral Incisor",
  canine: "Canine",
  premolar1: "First Premolar",
  premolar2: "Second Premolar",
  molar1: "First Molar",
  molar2: "Second Molar",
  molar3: "Third Molar (Wisdom)",
  dcCentral: "Primary Central Incisor",
  dcLateral: "Primary Lateral Incisor",
  dcCanine: "Primary Canine",
  dcMolar1: "Primary First Molar",
  dcMolar2: "Primary Second Molar",
};

const JAW_LABEL: Record<Jaw, { ar: string; en: string }> = {
  upper: { ar: "علوي", en: "Upper" },
  lower: { ar: "سفلي", en: "Lower" },
};

const SIDE_LABEL: Record<Side, { ar: string; en: string }> = {
  right: { ar: "أيمن", en: "Right" },
  left: { ar: "أيسر", en: "Left" },
};

export function getToothFullName(num: number, lang: "ar" | "en" = "ar"): string {
  const category = getToothCategory(num);
  const jaw = getToothJaw(num);
  const side = getToothSide(num);
  if (lang === "ar") {
    return `${TOOTH_NAME_AR[category]} ${JAW_LABEL[jaw].ar} ${SIDE_LABEL[side].ar}`;
  }
  return `${JAW_LABEL[jaw].en} ${SIDE_LABEL[side].en} ${TOOTH_NAME_EN[category]}`;
}

export function getArchTeeth(dentition: Dentition) {
  if (dentition === "deciduous") {
    return {
      upperRight: DECID_UPPER_RIGHT,
      upperLeft: DECID_UPPER_LEFT,
      lowerLeft: DECID_LOWER_LEFT,
      lowerRight: DECID_LOWER_RIGHT,
    };
  }
  return {
    upperRight: PERM_UPPER_RIGHT,
    upperLeft: PERM_UPPER_LEFT,
    lowerLeft: PERM_LOWER_LEFT,
    lowerRight: PERM_LOWER_RIGHT,
  };
}

export function getAllTeeth(dentition: Dentition): number[] {
  const arch = getArchTeeth(dentition);
  return [...arch.upperRight, ...arch.upperLeft, ...arch.lowerLeft, ...arch.lowerRight];
}
