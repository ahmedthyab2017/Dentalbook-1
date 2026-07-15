import { getToothCategory, type ToothCategory } from "@/lib/tooth";

type ToothMorph = "incisor" | "canine" | "premolar" | "molar";

/** Simple crown-only icon geometry — one shape per anatomical morphology. */
export type ToothIconShape =
  | { kind: "capsule"; w: number; h: number }
  | { kind: "leaf"; w: number; h: number }
  | { kind: "flower"; size: number };

const MORPH_BY_CATEGORY: Record<ToothCategory, ToothMorph> = {
  central: "incisor",
  lateral: "incisor",
  canine: "canine",
  premolar1: "premolar",
  premolar2: "premolar",
  molar1: "molar",
  molar2: "molar",
  molar3: "molar",
  dcCentral: "incisor",
  dcLateral: "incisor",
  dcCanine: "canine",
  dcMolar1: "molar",
  dcMolar2: "molar",
};

const SHAPE_BY_MORPH: Record<ToothMorph, ToothIconShape> = {
  incisor: { kind: "capsule", w: 20, h: 40 },
  canine: { kind: "leaf", w: 22, h: 42 },
  premolar: { kind: "capsule", w: 27, h: 40 },
  molar: { kind: "flower", size: 34 },
};

/** Crown-only outline icon per tooth, matching the reference FDI chart widget. */
export function getToothIconShape(num: number): ToothIconShape {
  return SHAPE_BY_MORPH[MORPH_BY_CATEGORY[getToothCategory(num)]];
}

export function iconBounds(shape: ToothIconShape): { w: number; h: number } {
  return shape.kind === "flower" ? { w: shape.size, h: shape.size } : { w: shape.w, h: shape.h };
}

/** Pointed capsule (rounded bottom, single peak at top) — canine icon. */
export function leafPath(w: number, h: number): string {
  const r = w / 2;
  return [
    `M 0 ${h - r}`,
    `A ${r} ${r} 0 0 0 ${w} ${h - r}`,
    `Q ${w} ${h * 0.22} ${w / 2} 0`,
    `Q 0 ${h * 0.22} 0 ${h - r}`,
    "Z",
  ].join(" ");
}

/** Rounded four-petal outline — molar icon. */
export function flowerPath(size: number): string {
  const r = size / 2;
  const c = size / 2;
  return [
    `M ${c} 0`,
    `A ${r} ${r} 0 0 1 ${size} ${c}`,
    `A ${r} ${r} 0 0 1 ${c} ${size}`,
    `A ${r} ${r} 0 0 1 0 ${c}`,
    `A ${r} ${r} 0 0 1 ${c} 0`,
    "Z",
  ].join(" ");
}
