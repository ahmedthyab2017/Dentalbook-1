import { getToothCategory, getToothJaw, type Jaw, type ToothCategory } from "@/lib/tooth";
import {
  getToothGeometry,
  getToothScale,
  getToothVisualByNumber,
  TOOTH_VIEWBOX_H,
  TOOTH_VIEWBOX_W,
  type ToothVisual,
} from "../teeth/geometry";

/**
 * Morphological groups used by the chart `Tooth` component.
 * Each maps to distinct inline SVG path geometry (crown + roots + occlusal).
 */
export type ToothMorphType = "central" | "lateral" | "canine" | "premolar" | "molar";

export type ToothPathSet = ToothVisual & {
  morphType: ToothMorphType;
  /** Crown-only path used for status overlay clipping. */
  overlayMask: string;
  viewBoxW: number;
  viewBoxH: number;
};

const CATEGORY_TO_MORPH: Record<ToothCategory, ToothMorphType> = {
  central: "central",
  lateral: "lateral",
  canine: "canine",
  premolar1: "premolar",
  premolar2: "premolar",
  molar1: "molar",
  molar2: "molar",
  molar3: "molar",
  dcCentral: "central",
  dcLateral: "lateral",
  dcCanine: "canine",
  dcMolar1: "molar",
  dcMolar2: "molar",
};

function toPathSet(jaw: Jaw, category: ToothCategory): ToothPathSet {
  const geo = getToothGeometry(jaw, category);
  return {
    ...geo,
    morphType: CATEGORY_TO_MORPH[category],
    overlayMask: geo.crown,
    viewBoxW: TOOTH_VIEWBOX_W,
    viewBoxH: TOOTH_VIEWBOX_H,
  };
}

/** Pre-built path registry — one entry per morphological type (upper jaw reference). */
export const TOOTH_PATH_REGISTRY: Record<ToothMorphType, ToothPathSet> = {
  central: toPathSet("upper", "central"),
  lateral: toPathSet("upper", "lateral"),
  canine: toPathSet("upper", "canine"),
  premolar: toPathSet("upper", "premolar1"),
  molar: toPathSet("upper", "molar1"),
};

export function getMorphType(num: number): ToothMorphType {
  return CATEGORY_TO_MORPH[getToothCategory(num)];
}

/** Tooth-specific paths (jaw-aware roots, size, occlusal count). */
export function getPathsForTooth(num: number): ToothPathSet {
  const jaw = getToothJaw(num);
  const category = getToothCategory(num);
  return toPathSet(jaw, category);
}

export function getPathsByType(type: ToothMorphType, jaw: Jaw = "upper"): ToothPathSet {
  if (jaw === "upper") return TOOTH_PATH_REGISTRY[type];
  const categoryMap: Record<ToothMorphType, ToothCategory> = {
    central: "central",
    lateral: "lateral",
    canine: "canine",
    premolar: "premolar1",
    molar: "molar1",
  };
  return toPathSet(jaw, categoryMap[type]);
}

export { getToothScale, getToothVisualByNumber, TOOTH_VIEWBOX_W, TOOTH_VIEWBOX_H };
