import { getToothCategory, type ToothCategory } from "@/lib/tooth";

export type ToothAssetId = "incisor-labial" | "canine-labial" | "premolar-labial" | "molar-labial";

const CATEGORY_ASSET: Record<ToothCategory, ToothAssetId> = {
  central: "incisor-labial",
  lateral: "incisor-labial",
  canine: "canine-labial",
  premolar1: "premolar-labial",
  premolar2: "premolar-labial",
  molar1: "molar-labial",
  molar2: "molar-labial",
  molar3: "molar-labial",
  dcCentral: "incisor-labial",
  dcLateral: "incisor-labial",
  dcCanine: "canine-labial",
  dcMolar1: "molar-labial",
  dcMolar2: "molar-labial",
};

export function getToothAssetId(num: number): ToothAssetId {
  return CATEGORY_ASSET[getToothCategory(num)];
}

export function getToothAssetSrc(num: number): string {
  return `/assets/teeth/${getToothAssetId(num)}.svg`;
}
