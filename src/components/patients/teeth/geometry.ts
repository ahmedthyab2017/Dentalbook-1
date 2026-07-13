import { getToothCategory, getToothJaw, isDeciduousTooth, type Jaw, type ToothCategory } from "@/lib/tooth";

/**
 * Parametric anatomical tooth geometry.
 *
 * Every tooth is drawn in a shared 100x176 viewBox, built from three parts:
 *  - `crown`   the labial (front) face outline — flat for incisors, a single
 *              pointed cusp for canines, a domed occlusal table for
 *              premolars/molars.
 *  - `occlusal` (premolars/molars only) a scalloped biting surface with the
 *              correct cusp count, drawn as if peeking slightly from above.
 *  - `roots`   1-3 root paths depending on the real anatomical root count.
 *
 * This keeps every one of the 32 permanent + deciduous teeth visually
 * distinct while staying maintainable (no 32 fully hand-authored paths).
 */

export const TOOTH_VIEWBOX_W = 100;
export const TOOTH_VIEWBOX_H = 176;

export type ToothVisual = {
  crown: string;
  crownTip: "flat" | "point" | "dome";
  incisalEdge?: string;
  occlusalOutline?: string;
  grooves: string[];
  cuspDots: { x: number; y: number }[];
  cervicalY: number;
  roots: string[];
  crownHalfWidth: number;
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Smooth symmetric crown trapezoid, centered at x=50. */
function crownFlat(opts: {
  topY: number;
  cervicalY: number;
  topHalfW: number;
  bulgeHalfW: number;
  bulgeY: number;
  cervicalHalfW: number;
  cornerR: number;
}): string {
  const { topY, cervicalY, topHalfW, bulgeHalfW, bulgeY, cervicalHalfW, cornerR } = opts;
  const cx = 50;
  return [
    `M ${round(cx - topHalfW + cornerR)} ${round(topY)}`,
    `Q ${round(cx - topHalfW)} ${round(topY)} ${round(cx - topHalfW)} ${round(topY + cornerR)}`,
    `C ${round(cx - bulgeHalfW * 1.02)} ${round(bulgeY - (bulgeY - topY) * 0.25)} ${round(cx - bulgeHalfW)} ${round(bulgeY)} ${round(cx - cervicalHalfW)} ${round(cervicalY)}`,
    `C ${round(cx - cervicalHalfW * 0.5)} ${round(cervicalY + 4)} ${round(cx + cervicalHalfW * 0.5)} ${round(cervicalY + 4)} ${round(cx + cervicalHalfW)} ${round(cervicalY)}`,
    `C ${round(cx + bulgeHalfW)} ${round(bulgeY)} ${round(cx + bulgeHalfW * 1.02)} ${round(bulgeY - (bulgeY - topY) * 0.25)} ${round(cx + topHalfW)} ${round(topY + cornerR)}`,
    `Q ${round(cx + topHalfW)} ${round(topY)} ${round(cx + topHalfW - cornerR)} ${round(topY)}`,
    `Z`,
  ].join(" ");
}

/** Canine-style crown with a single pointed cusp tip. */
function crownPoint(opts: {
  tipY: number;
  shoulderY: number;
  cervicalY: number;
  shoulderHalfW: number;
  bulgeHalfW: number;
  bulgeY: number;
  cervicalHalfW: number;
}): string {
  const { tipY, shoulderY, cervicalY, shoulderHalfW, bulgeHalfW, bulgeY, cervicalHalfW } = opts;
  const cx = 50;
  return [
    `M ${round(cx)} ${round(tipY)}`,
    `C ${round(cx - shoulderHalfW * 0.35)} ${round(tipY + (shoulderY - tipY) * 0.3)} ${round(cx - shoulderHalfW * 0.85)} ${round(shoulderY - 3)} ${round(cx - shoulderHalfW)} ${round(shoulderY)}`,
    `C ${round(cx - bulgeHalfW)} ${round(bulgeY - 6)} ${round(cx - bulgeHalfW)} ${round(bulgeY)} ${round(cx - cervicalHalfW)} ${round(cervicalY)}`,
    `C ${round(cx - cervicalHalfW * 0.5)} ${round(cervicalY + 4)} ${round(cx + cervicalHalfW * 0.5)} ${round(cervicalY + 4)} ${round(cx + cervicalHalfW)} ${round(cervicalY)}`,
    `C ${round(cx + bulgeHalfW)} ${round(bulgeY)} ${round(cx + bulgeHalfW)} ${round(bulgeY - 6)} ${round(cx + shoulderHalfW)} ${round(shoulderY)}`,
    `C ${round(cx + shoulderHalfW * 0.85)} ${round(shoulderY - 3)} ${round(cx + shoulderHalfW * 0.35)} ${round(tipY + (shoulderY - tipY) * 0.3)} ${round(cx)} ${round(tipY)}`,
    `Z`,
  ].join(" ");
}

/** Domed premolar/molar crown — the occlusal table sits on top of this. */
function crownDome(opts: {
  topY: number;
  cervicalY: number;
  topHalfW: number;
  bulgeHalfW: number;
  bulgeY: number;
  cervicalHalfW: number;
}): string {
  const { topY, cervicalY, topHalfW, bulgeHalfW, bulgeY, cervicalHalfW } = opts;
  const cx = 50;
  return [
    `M ${round(cx - topHalfW)} ${round(topY + 6)}`,
    `Q ${round(cx - topHalfW)} ${round(topY)} ${round(cx)} ${round(topY - 2)}`,
    `Q ${round(cx + topHalfW)} ${round(topY)} ${round(cx + topHalfW)} ${round(topY + 6)}`,
    `C ${round(cx + bulgeHalfW)} ${round(bulgeY - 4)} ${round(cx + bulgeHalfW)} ${round(bulgeY)} ${round(cx + cervicalHalfW)} ${round(cervicalY)}`,
    `C ${round(cx + cervicalHalfW * 0.5)} ${round(cervicalY + 4)} ${round(cx - cervicalHalfW * 0.5)} ${round(cervicalY + 4)} ${round(cx - cervicalHalfW)} ${round(cervicalY)}`,
    `C ${round(cx - bulgeHalfW)} ${round(bulgeY)} ${round(cx - bulgeHalfW)} ${round(bulgeY - 4)} ${round(cx - topHalfW)} ${round(topY + 6)}`,
    `Z`,
  ].join(" ");
}

/** Scalloped occlusal biting-table with `cuspCount` cusps + developmental grooves. */
function occlusalTable(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  cuspCount: number,
): { outline: string; grooves: string[]; cuspDots: { x: number; y: number }[] } {
  const pts: { x: number; y: number }[] = [];
  const n = Math.max(2, cuspCount);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 - Math.PI / 2;
    pts.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry * 0.82 });
  }
  let outline = `M ${round(pts[0].x)} ${round(pts[0].y)} `;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const midAngle = (i + 0.5) / n * Math.PI * 2 - Math.PI / 2;
    const notchR = 0.62;
    const notchX = cx + Math.cos(midAngle) * rx * notchR;
    const notchY = cy + Math.sin(midAngle) * ry * 0.82 * notchR;
    outline += `Q ${round(cur.x + (notchX - cur.x) * 0.3)} ${round(cur.y + (notchY - cur.y) * 0.3)} ${round(notchX)} ${round(notchY)} `;
    outline += `Q ${round(notchX + (next.x - notchX) * 0.7)} ${round(notchY + (next.y - notchY) * 0.7)} ${round(next.x)} ${round(next.y)} `;
  }
  outline += "Z";

  const grooves: string[] = [];
  for (let i = 0; i < n; i++) {
    const midAngle = (i + 0.5) / n * Math.PI * 2 - Math.PI / 2;
    const notchX = cx + Math.cos(midAngle) * rx * 0.6;
    const notchY = cy + Math.sin(midAngle) * ry * 0.82 * 0.6;
    grooves.push(`M ${round(cx)} ${round(cy)} L ${round(notchX)} ${round(notchY)}`);
  }
  return { outline, grooves, cuspDots: pts };
}

/** Single tapering root, optionally leaning left/right and curving. */
function rootPath(opts: {
  baseY: number;
  apexY: number;
  baseHalfW: number;
  lean: number;
  curve: number;
  apexX?: number;
}): string {
  const { baseY, apexY, baseHalfW, lean, curve, apexX = 50 + lean } = opts;
  const cx = 50 + lean * 0.15;
  const midY = baseY + (apexY - baseY) * 0.55;
  return [
    `M ${round(cx - baseHalfW)} ${round(baseY)}`,
    `C ${round(cx - baseHalfW * 0.9 + curve)} ${round(baseY + (midY - baseY) * 0.5)} ${round(cx - baseHalfW * 0.35 + curve)} ${round(midY)} ${round(apexX - 1.4)} ${round(apexY - 6)}`,
    `Q ${round(apexX)} ${round(apexY)} ${round(apexX + 1.4)} ${round(apexY - 6)}`,
    `C ${round(cx + baseHalfW * 0.35 + curve)} ${round(midY)} ${round(cx + baseHalfW * 0.9 + curve)} ${round(baseY + (midY - baseY) * 0.5)} ${round(cx + baseHalfW)} ${round(baseY)}`,
    `Z`,
  ].join(" ");
}

function singleRoot(baseY: number, cervicalHalfW: number, length: number, curve = 0): string[] {
  return [
    rootPath({
      baseY,
      apexY: baseY + length,
      baseHalfW: cervicalHalfW,
      lean: 0,
      curve,
    }),
  ];
}

function twoRoots(baseY: number, cervicalHalfW: number, length: number, spread: number): string[] {
  return [
    rootPath({ baseY, apexY: baseY + length, baseHalfW: cervicalHalfW * 0.62, lean: -spread, curve: -spread * 0.4, apexX: 50 - spread * 0.7 }),
    rootPath({ baseY, apexY: baseY + length, baseHalfW: cervicalHalfW * 0.62, lean: spread, curve: spread * 0.4, apexX: 50 + spread * 0.7 }),
  ];
}

function threeRoots(baseY: number, cervicalHalfW: number, length: number, spread: number): string[] {
  return [
    rootPath({ baseY, apexY: baseY + length * 0.92, baseHalfW: cervicalHalfW * 0.46, lean: -spread, curve: -spread * 0.5, apexX: 50 - spread * 1.05 }),
    rootPath({ baseY, apexY: baseY + length, baseHalfW: cervicalHalfW * 0.5, lean: 0, curve: 0, apexX: 50 }),
    rootPath({ baseY, apexY: baseY + length * 0.92, baseHalfW: cervicalHalfW * 0.46, lean: spread, curve: spread * 0.5, apexX: 50 + spread * 1.05 }),
  ];
}

type GeoKey = `${Jaw}:${ToothCategory}`;

const CERV_Y = 78;

function buildIncisor(jaw: Jaw, size: "central" | "lateral", deciduous = false): ToothVisual {
  const upper = jaw === "upper";
  const central = size === "central";
  const scale = deciduous ? 0.86 : 1;
  const topHalfW = (central ? (upper ? 24 : 15) : upper ? 19 : 17) * scale;
  const bulgeHalfW = topHalfW + (upper ? 5 : 3);
  const cervicalHalfW = bulgeHalfW * 0.56;
  const topY = upper ? 16 : 22;
  const cervicalY = CERV_Y - (upper ? 0 : 4);
  const bulgeY = topY + (cervicalY - topY) * 0.42;
  const rootLen = (upper ? (central ? 74 : 68) : central ? 58 : 62) * scale;
  return {
    crown: crownFlat({ topY, cervicalY, topHalfW, bulgeHalfW, bulgeY, cervicalHalfW, cornerR: central ? 3.2 : 4.4 }),
    crownTip: "flat",
    incisalEdge: `M ${round(50 - topHalfW + 3)} ${round(topY + 1.5)} L ${round(50 + topHalfW - 3)} ${round(topY + 1.5)}`,
    grooves: central
      ? [`M ${round(50 - topHalfW * 0.32)} ${round(topY + 3)} L ${round(50 - topHalfW * 0.32)} ${round(topY + 11)}`, `M ${round(50 + topHalfW * 0.32)} ${round(topY + 3)} L ${round(50 + topHalfW * 0.32)} ${round(topY + 11)}`]
      : [],
    cuspDots: [],
    cervicalY,
    roots: singleRoot(cervicalY - 4, cervicalHalfW, rootLen, upper ? 0 : 0.5),
    crownHalfWidth: bulgeHalfW,
  };
}

function buildCanine(jaw: Jaw, deciduous = false): ToothVisual {
  const upper = jaw === "upper";
  const scale = deciduous ? 0.88 : 1;
  const shoulderHalfW = 20 * scale;
  const bulgeHalfW = 24 * scale;
  const cervicalHalfW = bulgeHalfW * 0.52;
  const tipY = (upper ? 12 : 18) * (deciduous ? 1.05 : 1);
  const shoulderY = tipY + 14 * scale;
  const cervicalY = CERV_Y - (upper ? 0 : 4);
  const bulgeY = shoulderY + (cervicalY - shoulderY) * 0.45;
  const rootLen = (upper ? 86 : 70) * scale;
  return {
    crown: crownPoint({ tipY, shoulderY, cervicalY, shoulderHalfW, bulgeHalfW, bulgeY, cervicalHalfW }),
    crownTip: "point",
    grooves: [`M 50 ${round(tipY + 6)} L 50 ${round(cervicalY - 8)}`],
    cuspDots: [{ x: 50, y: tipY + 2 }],
    cervicalY,
    roots: singleRoot(cervicalY - 4, cervicalHalfW, rootLen, upper ? -0.6 : 0.4),
    crownHalfWidth: bulgeHalfW,
  };
}

function buildPremolar(jaw: Jaw, which: 1 | 2): ToothVisual {
  const upper = jaw === "upper";
  const topHalfW = (upper ? 25 : 22) * (which === 1 ? 1 : 0.92);
  const bulgeHalfW = topHalfW + 4;
  const cervicalHalfW = bulgeHalfW * 0.58;
  const topY = 20;
  const cervicalY = CERV_Y;
  const bulgeY = topY + (cervicalY - topY) * 0.5;
  const cusps = which === 1 && !upper ? 2 : upper ? 2 : 3;
  const occ = occlusalTable(50, topY + 9, topHalfW * 0.82, 9, cusps);
  const rootLen = upper ? 62 : 66;
  let roots: string[];
  if (which === 1 && upper) roots = twoRoots(cervicalY - 4, cervicalHalfW, rootLen, 7);
  else roots = singleRoot(cervicalY - 4, cervicalHalfW, rootLen + (which === 2 ? 4 : 0), upper ? -0.3 : 0.3);
  return {
    crown: crownDome({ topY, cervicalY, topHalfW, bulgeHalfW, bulgeY, cervicalHalfW }),
    crownTip: "dome",
    occlusalOutline: occ.outline,
    grooves: occ.grooves,
    cuspDots: occ.cuspDots,
    cervicalY,
    roots,
    crownHalfWidth: bulgeHalfW,
  };
}

function buildMolar(jaw: Jaw, which: 1 | 2 | 3, deciduous = false): ToothVisual {
  const upper = jaw === "upper";
  const bigness = which === 1 ? 1 : which === 2 ? 0.92 : 0.78;
  const decidScale = deciduous ? 0.82 : 1;
  const topHalfW = (upper ? 33 : 34) * bigness * decidScale;
  const bulgeHalfW = topHalfW + 3;
  const cervicalHalfW = bulgeHalfW * 0.66;
  const topY = 20;
  const cervicalY = CERV_Y;
  const bulgeY = topY + (cervicalY - topY) * 0.55;
  // Lower first molars carry the classic 5-cusp Y-groove pattern; second
  // molars drop the distal cusp; third molars are the most variable/simplified.
  const cuspCount = upper ? (which === 3 ? 3 : 4) : which === 1 ? 5 : 4;
  const occ = occlusalTable(50, topY + 11, topHalfW * 0.84, 11, cuspCount);
  const rootBaseY = cervicalY - 4;
  const rootLen = (which === 1 ? 58 : which === 2 ? 52 : 40) * decidScale;
  let roots: string[];
  if (upper) roots = threeRoots(rootBaseY, cervicalHalfW, rootLen, which === 3 ? 6 : 9);
  else roots = twoRoots(rootBaseY, cervicalHalfW, rootLen, which === 3 ? 5 : 8);
  return {
    crown: crownDome({ topY, cervicalY, topHalfW, bulgeHalfW, bulgeY, cervicalHalfW }),
    crownTip: "dome",
    occlusalOutline: occ.outline,
    grooves: occ.grooves,
    cuspDots: occ.cuspDots,
    cervicalY,
    roots,
    crownHalfWidth: bulgeHalfW,
  };
}

const GEOMETRY_CACHE = new Map<string, ToothVisual>();

function computeGeometry(jaw: Jaw, category: ToothCategory): ToothVisual {
  switch (category) {
    case "central":
      return buildIncisor(jaw, "central");
    case "lateral":
      return buildIncisor(jaw, "lateral");
    case "canine":
      return buildCanine(jaw);
    case "premolar1":
      return buildPremolar(jaw, 1);
    case "premolar2":
      return buildPremolar(jaw, 2);
    case "molar1":
      return buildMolar(jaw, 1);
    case "molar2":
      return buildMolar(jaw, 2);
    case "molar3":
      return buildMolar(jaw, 3);
    case "dcCentral":
      return buildIncisor(jaw, "central", true);
    case "dcLateral":
      return buildIncisor(jaw, "lateral", true);
    case "dcCanine":
      return buildCanine(jaw, true);
    case "dcMolar1":
      return buildMolar(jaw, 2, true);
    case "dcMolar2":
      return buildMolar(jaw, 1, true);
  }
}

export function getToothGeometry(jaw: Jaw, category: ToothCategory): ToothVisual {
  const key: GeoKey = `${jaw}:${category}`;
  const cached = GEOMETRY_CACHE.get(key);
  if (cached) return cached;
  const geo = computeGeometry(jaw, category);
  GEOMETRY_CACHE.set(key, geo);
  return geo;
}

export function getToothVisualByNumber(num: number): ToothVisual {
  const jaw = getToothJaw(num);
  const category = getToothCategory(num);
  return getToothGeometry(jaw, category);
}

export function getToothScale(num: number): number {
  return isDeciduousTooth(num) ? 0.82 : 1;
}
