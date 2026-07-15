"use client";

import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";
import { getToothIconShape, iconBounds, leafPath, flowerPath } from "./toothSchematicPaths";

const STROKE = "#94a3b8";
const CROWN_FILL = "#ffffff";
const VIEW_PAD = 3;

function statusTint(state: ToothState): string | null {
  switch (state) {
    case "decay":
      return "rgba(239, 68, 68, 0.35)";
    case "filling":
      return "rgba(59, 130, 246, 0.35)";
    case "rct":
      return "rgba(249, 115, 22, 0.3)";
    case "crown":
      return "rgba(212, 175, 55, 0.4)";
    case "implant":
      return "rgba(168, 85, 247, 0.35)";
    case "missing":
      return "rgba(148, 163, 184, 0.2)";
    case "extraction":
      return "rgba(127, 29, 29, 0.18)";
    default:
      return null;
  }
}

export function ToothSchematic({
  num,
  status,
  className,
}: {
  num: number;
  status: ToothState;
  /** Kept for API compatibility with callers; icons no longer flip per jaw. */
  jaw?: "upper" | "lower";
  className?: string;
}) {
  const shape = getToothIconShape(num);
  const { w, h } = iconBounds(shape);
  const tint = statusTint(status);
  const dashed = status === "missing" ? "3 2.5" : undefined;

  return (
    <span className={cn("tooth-schematic-shell", className)}>
      <svg
        className="tooth-schematic-svg"
        viewBox={`${-VIEW_PAD} ${-VIEW_PAD} ${w + VIEW_PAD * 2} ${h + VIEW_PAD * 2}`}
        role="img"
        aria-hidden
      >
        {shape.kind === "capsule" && (
          <>
            <rect x={0} y={0} width={shape.w} height={shape.h} rx={shape.w / 2} ry={shape.w / 2} fill={CROWN_FILL} stroke={STROKE} strokeWidth={1.5} strokeDasharray={dashed} />
            {tint && <rect x={0} y={0} width={shape.w} height={shape.h} rx={shape.w / 2} ry={shape.w / 2} fill={tint} stroke="none" pointerEvents="none" />}
          </>
        )}
        {shape.kind === "leaf" && (
          <>
            <path d={leafPath(shape.w, shape.h)} fill={CROWN_FILL} stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" strokeDasharray={dashed} />
            {tint && <path d={leafPath(shape.w, shape.h)} fill={tint} stroke="none" pointerEvents="none" />}
          </>
        )}
        {shape.kind === "flower" && (
          <>
            <path d={flowerPath(shape.size)} fill={CROWN_FILL} stroke={STROKE} strokeWidth={1.5} strokeLinejoin="round" strokeDasharray={dashed} />
            {tint && <path d={flowerPath(shape.size)} fill={tint} stroke="none" pointerEvents="none" />}
          </>
        )}
        {status === "extraction" && (
          <path
            d={`M ${w * 0.22} ${h * 0.22} L ${w * 0.78} ${h * 0.78} M ${w * 0.78} ${h * 0.22} L ${w * 0.22} ${h * 0.78}`}
            stroke="#dc2626"
            strokeWidth={1.8}
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}
      </svg>
    </span>
  );
}
