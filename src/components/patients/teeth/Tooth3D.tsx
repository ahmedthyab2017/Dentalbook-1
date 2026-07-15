"use client";

import { ToothAssetSvg } from "../dental-chart/ToothAssetSvg";
import { getToothJaw } from "@/lib/tooth";
import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";

export type ToothStatusStyle = {
  fill?: string;
  stroke?: string;
  opacity?: number;
};

export function getToothStatusStyle(state: ToothState): ToothStatusStyle {
  switch (state) {
    case "decay":
      return { fill: "rgba(239,68,68,0.35)" };
    case "filling":
      return { fill: "rgba(59,130,246,0.35)" };
    case "rct":
      return { fill: "rgba(249,115,22,0.3)" };
    case "crown":
      return { fill: "rgba(212,175,55,0.4)" };
    case "implant":
      return { fill: "rgba(168,85,247,0.35)" };
    case "missing":
      return { opacity: 0.45 };
    case "extraction":
      return { fill: "rgba(127,29,29,0.2)" };
    default:
      return {};
  }
}

export function Tooth3D({ num, state = "healthy", className }: { num: number; state?: ToothState; className?: string; showShadow?: boolean }) {
  return <ToothAssetSvg num={num} status={state} jaw={getToothJaw(num)} className={cn(className)} />;
}
