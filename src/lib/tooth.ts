import type { ToothState } from "@/types/db";

// Ported from _toothStates()/_toothStateLabel() (app/app.js:3663-3666).
export const TOOTH_STATES: ToothState[] = ["healthy", "decay", "filling", "rct", "crown", "missing"];

export const TOOTH_STATE_LABEL_AR: Record<ToothState, string> = {
  healthy: "سليم",
  decay: "تسوس",
  filling: "حشوة",
  rct: "علاج عصب",
  crown: "تلبيسة",
  missing: "مفقود",
};

export type Dentition = "permanent" | "deciduous";
export type ToothType = "central" | "lateral" | "canine" | "premolar" | "molar";

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

export function getToothType(num: number): ToothType {
  const pos = num % 10;
  if (pos === 1) return "central";
  if (pos === 2) return "lateral";
  if (pos === 3) return "canine";
  if (pos === 4 || pos === 5) return isDeciduousTooth(num) ? "molar" : "premolar";
  return "molar";
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
