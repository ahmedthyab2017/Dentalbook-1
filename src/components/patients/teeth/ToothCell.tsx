"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { ToothSchematic } from "../dental-chart/ToothSchematic";
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
  lang?: "ar" | "en";
}) {
  const category = getToothCategory(num);

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
        animate={selected ? { scale: 1.04 } : { scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <ToothSchematic num={num} status={state} jaw={jaw} className="tooth-svg" />
      </motion.button>
      {jaw === "lower" && <span className="tooth-num tooth-num-bottom">{num}</span>}
    </div>
  );
}
