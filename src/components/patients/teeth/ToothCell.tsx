"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { Tooth } from "../dental-chart/Tooth";
import { getMorphType } from "../dental-chart/toothPaths";
import type { ToothState } from "@/types/db";
import { getToothCategory } from "@/lib/tooth";
import { cn } from "@/lib/cn";

export function ToothCell({
  num, jaw, state, selected = false, archStyle, onClick, label, wrapClassName, cellClassName,
}: {
  num: number;
  jaw: "upper" | "lower";
  state: ToothState;
  selected?: boolean;
  archStyle?: CSSProperties;
  onClick?: () => void;
  label?: string;
  wrapClassName?: string;
  cellClassName?: string;
}) {
  const category = getToothCategory(num);
  const morphType = getMorphType(num);

  return (
    <div className={cn("tooth-cell-arch", `tc-${category}`, wrapClassName)} style={archStyle}>
      {jaw === "upper" && <span className="tooth-num tooth-num-top">{num}</span>}
      <motion.button
        type="button"
        className={cn("tooth-cell", `t-${state}`, selected && "selected", cellClassName)}
        onClick={onClick}
        aria-label={label ?? String(num)}
        aria-pressed={selected}
        initial={false}
        animate={selected ? { y: -4, scale: 1.03 } : { y: 0, scale: 1 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Tooth type={morphType} status={state} num={num} jaw={jaw} selected={selected} className="tooth-svg" />
      </motion.button>
      {jaw === "lower" && <span className="tooth-num tooth-num-bottom">{num}</span>}
    </div>
  );
}
