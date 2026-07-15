"use client";

import { motion } from "framer-motion";
import { ToothAssetSvg } from "../dental-chart/ToothAssetSvg";
import type { ToothState } from "@/types/db";
import { cn } from "@/lib/cn";

export function ToothCell({
  num,
  jaw,
  state,
  selected = false,
  onClick,
  label,
  wrapClassName,
  cellClassName,
}: {
  num: number;
  jaw: "upper" | "lower";
  state: ToothState;
  selected?: boolean;
  onClick?: () => void;
  label?: string;
  wrapClassName?: string;
  cellClassName?: string;
}) {
  return (
    <div className={cn("tooth-cell-arch", wrapClassName)}>
      {jaw === "upper" && <span className="tooth-num tooth-num-top">{num}</span>}
      <motion.button
        type="button"
        className={cn("tooth-cell", `t-${state}`, selected && "selected", cellClassName)}
        onClick={onClick}
        aria-label={label ?? String(num)}
        aria-pressed={selected}
        initial={false}
        animate={selected ? { scale: 1.06 } : { scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <ToothAssetSvg num={num} status={state} jaw={jaw} />
      </motion.button>
      {jaw === "lower" && <span className="tooth-num tooth-num-bottom">{num}</span>}
    </div>
  );
}
