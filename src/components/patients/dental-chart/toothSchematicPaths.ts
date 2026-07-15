import { getToothCategory, type ToothCategory } from "@/lib/tooth";

export type SchematicShape = {
  morph: "incisor" | "canine" | "premolar" | "molar";
  /** Crown outline path (y grows downward in SVG space). */
  crown: string;
  /** Root fill area behind root lines. */
  rootFill: string;
  /** Root outline strokes (1–3 paths). */
  roots: string[];
  width: number;
  height: number;
};

function morphFromCategory(cat: ToothCategory): SchematicShape["morph"] {
  if (cat === "central" || cat === "lateral" || cat === "dcCentral" || cat === "dcLateral") return "incisor";
  if (cat === "canine" || cat === "dcCanine") return "canine";
  if (cat === "premolar1" || cat === "premolar2") return "premolar";
  return "molar";
}

/** Flat schematic tooth icons — matches standard dental chart reference. */
export function getSchematicShape(num: number): SchematicShape {
  const cat = getToothCategory(num);
  const morph = morphFromCategory(cat);

  switch (morph) {
    case "incisor":
      return {
        morph,
        width: 26,
        height: 48,
        crown: "M 6 24 L 6 9 Q 13 5 20 9 L 20 24 Z",
        rootFill: "M 7 24 L 19 24 L 19 44 L 7 44 Z",
        roots: ["M 13 24 L 13 44"],
      };
    case "canine":
      return {
        morph,
        width: 24,
        height: 50,
        crown: "M 12 24 L 12 12 L 18 4 L 24 12 L 24 24 Z",
        rootFill: "M 13 24 L 23 24 L 23 46 L 13 46 Z",
        roots: ["M 18 24 L 18 46"],
      };
    case "premolar":
      return {
        morph,
        width: 28,
        height: 50,
        crown: "M 6 24 L 6 13 Q 9 8 14 10 Q 18 7 22 10 Q 27 8 30 13 L 30 24 Z",
        rootFill: "M 7 24 L 29 24 L 29 45 L 7 45 Z",
        roots: ["M 13 24 L 13 44", "M 23 24 L 23 44"],
      };
    default:
      return {
        morph: "molar",
        width: 36,
        height: 52,
        crown: "M 4 24 L 4 14 Q 7 9 12 11 Q 16 7 20 10 Q 24 7 28 10 Q 33 9 36 14 L 36 24 Z",
        rootFill: "M 5 24 L 35 24 L 35 46 L 5 46 Z",
        roots: ["M 11 24 L 11 45", "M 20 24 L 20 45", "M 29 24 L 29 45"],
      };
  }
}
