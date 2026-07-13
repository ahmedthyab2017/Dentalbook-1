"use client";

import { ToothCell } from "@/components/patients/teeth/ToothCell";
import { DentalChart, archStyle, type DentalChartRenderProps } from "@/components/patients/DentalChart";
import type { ToothState } from "@/types/db";
import "./qf-dental-chart.css";

const LEGEND = [
  { id: "healthy", ar: "سليم", en: "Healthy", dot: "leg-healthy" },
  { id: "decay", ar: "تسوس", en: "Caries", dot: "leg-decay" },
  { id: "filling", ar: "حشوة", en: "Filling", dot: "leg-filling" },
  { id: "rct", ar: "علاج عصب", en: "Root Canal", dot: "leg-rct" },
  { id: "crown", ar: "تلبيسة", en: "Crown", dot: "leg-crown" },
  { id: "implant", ar: "زراعة", en: "Implant", dot: "leg-implant" },
  { id: "missing", ar: "مفقود", en: "Missing", dot: "leg-missing" },
] as const;

export function QfDentalChart({
  selected,
  onToggle,
  chart = {},
  lang = "ar",
}: {
  selected: string[];
  onToggle: (n: number) => void;
  chart?: Record<string, ToothState | string>;
  lang?: "ar" | "en";
}) {
  function renderTooth({ num, jaw, state, selected: isSel, archIdx, archSide, archCount }: DentalChartRenderProps) {
    return (
      <ToothCell
        key={num}
        num={num}
        jaw={jaw}
        state={state}
        selected={isSel}
        archStyle={archStyle(archIdx, archCount, archSide, jaw)}
        onClick={() => onToggle(num)}
        wrapClassName="qf-tooth-wrap"
        cellClassName="qf-tooth-cell"
        label={`${lang === "ar" ? "السن" : "Tooth"} ${num}`}
      />
    );
  }

  return (
    <div className="qf-dental-chart">
      <DentalChart
        className="qf-dc-shared"
        lang={lang}
        chart={chart}
        selectedList={selected}
        renderTooth={renderTooth}
        showDentitionToggle
      />

      <div className="qf-dc-legend">
        {LEGEND.map((item) => (
          <span className="qf-dc-leg" key={item.id}>
            <i className={item.dot} aria-hidden />
            {lang === "ar" ? item.ar : item.en}
          </span>
        ))}
      </div>
    </div>
  );
}
