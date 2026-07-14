"use client";

import { Tooth as AnatomicalTooth } from "../dental-chart/Tooth";
import { getMorphType } from "../dental-chart/toothPaths";
import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";

export type ToothStatusStyle = {
  crownFill: string;
  rootFill: string;
  crownStroke: string;
  rootStroke: string;
  opacity: number;
  showGloss: boolean;
  dashed: boolean;
  tint?: string;
  showX: boolean;
};

export function getToothStatusStyle(state: ToothState): ToothStatusStyle {
  const base = { opacity: 1, showGloss: true, dashed: false, showX: false };
  switch (state) {
    case "crown": return { ...base, crownFill: "url(#tc-gold)", rootFill: "url(#tc-root)", crownStroke: "#8a6417", rootStroke: "#b8935e" };
    case "implant": return { ...base, crownFill: "url(#tc-implant)", rootFill: "url(#tc-implant)", crownStroke: "#5b1a8b", rootStroke: "#5b1a8b" };
    case "rct": return { ...base, crownFill: "url(#tc-enamel)", rootFill: "url(#tc-rct-root)", crownStroke: "#aebfc8", rootStroke: "#9a3412" };
    case "decay": return { ...base, crownFill: "url(#tc-enamel)", rootFill: "url(#tc-root)", crownStroke: "#aebfc8", rootStroke: "#b8935e", tint: "rgba(239,68,68,0.14)" };
    case "filling": return { ...base, crownFill: "url(#tc-enamel)", rootFill: "url(#tc-root)", crownStroke: "#aebfc8", rootStroke: "#b8935e", tint: "rgba(34,197,94,0.12)" };
    case "missing": return { crownFill: "url(#tc-missing)", rootFill: "url(#tc-missing)", crownStroke: "#94a3b8", rootStroke: "#94a3b8", opacity: 0.38, showGloss: false, dashed: true, showX: false };
    case "extraction": return { crownFill: "url(#tc-extraction)", rootFill: "url(#tc-extraction)", crownStroke: "#450a0a", rootStroke: "#450a0a", opacity: 0.92, showGloss: false, dashed: false, showX: true };
    default: return { ...base, crownFill: "url(#tc-enamel)", rootFill: "url(#tc-root)", crownStroke: "#aebfc8", rootStroke: "#b8935e" };
  }
}

export function Tooth3D({ num, state = "healthy", className, showShadow = true }: { num: number; state?: ToothState; className?: string; showShadow?: boolean }) {
  return <AnatomicalTooth type={getMorphType(num)} status={state} num={num} className={cn(className)} showShadow={showShadow} />;
}
