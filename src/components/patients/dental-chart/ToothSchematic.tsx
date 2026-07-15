"use client";

import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";
import { getSchematicShape } from "./toothSchematicPaths";

const STROKE = "#94a3b8";
const CROWN = "#ffffff";
const ROOT_FILL = "rgba(148, 163, 184, 0.38)";

function statusFill(state: ToothState): string | null {
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
      return "rgba(148, 163, 184, 0.25)";
    case "extraction":
      return "rgba(127, 29, 29, 0.2)";
    default:
      return null;
  }
}

export function ToothSchematic({
  num,
  status,
  jaw,
  className,
}: {
  num: number;
  status: ToothState;
  jaw: "upper" | "lower";
  className?: string;
}) {
  const shape = getSchematicShape(num);
  const tint = statusFill(status);
  const upper = jaw === "upper";
  const vbW = shape.morph === "molar" ? 40 : shape.morph === "premolar" ? 36 : 32;

  return (
    <span className={cn("tooth-schematic-shell", className)}>
      <svg
        className={cn("tooth-schematic-svg", upper && "tooth-schematic-upper")}
        viewBox={`0 0 ${vbW} ${shape.height}`}
        role="img"
        aria-hidden
      >
        <g transform={`translate(${(vbW - (shape.morph === "molar" ? 36 : shape.morph === "premolar" ? 28 : shape.morph === "canine" ? 24 : 22)) / 2}, 0)`}>
          <path d={shape.rootFill} fill={ROOT_FILL} stroke="none" />
          {shape.roots.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={STROKE} strokeWidth={1.1} strokeLinecap="round" />
          ))}
          <path d={shape.crown} fill={CROWN} stroke={STROKE} strokeWidth={1.2} strokeLinejoin="round" />
          {tint && <path d={shape.crown} fill={tint} stroke="none" pointerEvents="none" />}
          {status === "missing" && (
            <path d={shape.crown} fill="none" stroke={STROKE} strokeWidth={1} strokeDasharray="3 2" pointerEvents="none" />
          )}
          {status === "extraction" && (
            <path
              d="M 8 10 L 28 22 M 28 10 L 8 22"
              stroke="#dc2626"
              strokeWidth={1.8}
              strokeLinecap="round"
              pointerEvents="none"
            />
          )}
        </g>
      </svg>
    </span>
  );
}
