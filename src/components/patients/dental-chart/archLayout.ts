import { getArchTeeth, type Dentition } from "@/lib/tooth";
import { getMorphType, type ToothMorphType } from "./toothPaths";

export type ArchToothSlot = {
  num: number;
  jaw: "upper" | "lower";
  side: "right" | "left";
  slotIndex: number;
  quadrantSize: number;
  morphType: ToothMorphType;
};

export type ArchLayout = { upper: ArchToothSlot[]; lower: ArchToothSlot[] };

function mapQuadrant(nums: number[], jaw: "upper" | "lower", side: "right" | "left"): ArchToothSlot[] {
  return nums.map((num, slotIndex) => ({
    num, jaw, side, slotIndex, quadrantSize: nums.length, morphType: getMorphType(num),
  }));
}

export function buildArchLayout(dentition: Dentition = "permanent"): ArchLayout {
  const arch = getArchTeeth(dentition);
  return {
    upper: [...mapQuadrant(arch.upperRight, "upper", "right"), ...mapQuadrant(arch.upperLeft, "upper", "left")],
    lower: [...mapQuadrant(arch.lowerRight, "lower", "right"), ...mapQuadrant(arch.lowerLeft, "lower", "left")],
  };
}
