import { Tooth3D } from "./teeth/Tooth3D";
import type { ToothState } from "@/types/db";

/**
 * Thin compatibility wrapper — renders the realistic anatomical SVG for a
 * given FDI tooth number. Kept as a stable import path for existing
 * consumers (DentalChart, QfDentalChart); the real anatomy lives in
 * `./teeth/Tooth3D`.
 */
export function ToothSVG({ num, state }: { num: number; jaw?: "upper" | "lower"; state?: ToothState }) {
  return (
    <div className="dc-tooth-graphic">
      <Tooth3D num={num} state={state} className="tooth-svg" />
    </div>
  );
}
