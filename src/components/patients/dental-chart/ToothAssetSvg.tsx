"use client";

import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";
import { getToothAssetSrc } from "./toothAssets";

/** Crown-zone overlays matching the light clinical chart reference. */
function overlayClass(state: ToothState): string | null {
  switch (state) {
    case "decay":
      return "tooth-ov decay";
    case "filling":
      return "tooth-ov filling";
    case "rct":
      return "tooth-ov rct";
    case "crown":
      return "tooth-ov crown-full";
    case "implant":
      return "tooth-ov implant";
    case "missing":
      return "tooth-ov missing";
    case "extraction":
      return "tooth-ov extraction";
    default:
      return null;
  }
}

export function ToothAssetSvg({
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
  const src = getToothAssetSrc(num);
  const ov = overlayClass(status);
  const upper = jaw === "upper";

  return (
    <span className={cn("tooth-asset-shell", className)}>
      <span className={cn("tooth-asset-body", upper && "tooth-asset-upper")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="tooth-asset-img" draggable={false} />
        {ov && <span className={ov} aria-hidden />}
        {status === "extraction" && <span className="tooth-ov-x" aria-hidden>×</span>}
      </span>
    </span>
  );
}
