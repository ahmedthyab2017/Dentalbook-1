"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { ToothAssetSvg } from "../dental-chart/ToothAssetSvg";
import type { ToothState } from "@/types/db";
import { getToothCategory, getToothType, TOOTH_TYPE_LABELS } from "@/lib/tooth";
import { cn } from "@/lib/cn";

function displayType(num: number, lang: "ar" | "en"): string {
  const t = getToothType(num);
  if (t === "central") return lang === "ar" ? TOOTH_TYPE_LABELS.central.ar : "Incisor";
  if (t === "lateral") return lang === "ar" ? TOOTH_TYPE_LABELS.lateral.ar : "Incisor";
  return lang === "ar" ? TOOTH_TYPE_LABELS[t].ar : TOOTH_TYPE_LABELS[t].en;
}

export function ToothCell({
  num, jaw, state, selected = false, archStyle, onClick, label, wrapClassName, cellClassName, lang = "ar",
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
  const typeLabel = displayType(num, lang);

  return (
    <div className={cn("tooth-cell-arch", `tc-${category}`, wrapClassName)} style={archStyle}>
      {jaw === "upper" && (
        <>
          <span className="tooth-num tooth-num-top">{num}</span>
          <span className="tooth-type-label">{typeLabel}</span>
        </>
      )}
      <motion.button
        type="button"
        className={cn("tooth-cell", `t-${state}`, selected && "selected", cellClassName)}
        onClick={onClick}
        aria-label={label ?? String(num)}
        aria-pressed={selected}
        initial={false}
        animate={selected ? { y: -3, scale: 1.02 } : { y: 0, scale: 1 }}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <ToothAssetSvg num={num} status={state} jaw={jaw} className="tooth-svg" />
      </motion.button>
      {jaw === "lower" && (
        <>
          <span className="tooth-type-label">{typeLabel}</span>
          <span className="tooth-num tooth-num-bottom">{num}</span>
        </>
      )}
    </div>
  );
}
