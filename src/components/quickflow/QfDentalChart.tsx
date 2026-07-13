"use client";

import { ToothSVG } from "@/components/patients/ToothSVG";
import { DentalChart, archStyle, type DentalChartRenderProps } from "@/components/patients/DentalChart";
import { cn } from "@/lib/cn";
import type { ToothState } from "@/types/db";
import "./qf-dental-chart.css";

const LEGEND = [
  { id: "healthy", ar: "سليم", en: "Healthy", dot: "leg-healthy" },
  { id: "decay", ar: "تسوس", en: "Caries", dot: "leg-decay" },
  { id: "done", ar: "علاج منجز", en: "Completed", dot: "leg-done" },
  { id: "active", ar: "علاج جاري", en: "In progress", dot: "leg-active" },
  { id: "filling", ar: "محشو", en: "Filled", dot: "leg-filling" },
  { id: "missing", ar: "خلع", en: "Extracted", dot: "leg-missing" },
  { id: "na", ar: "غير متاح", en: "N/A", dot: "leg-na" },
] as const;

function mapChartState(state: ToothState | undefined, selected: boolean): string {
  if (selected) return "qf-active";
  switch (state) {
    case "decay":
      return "t-decay";
    case "filling":
      return "t-filling";
    case "rct":
      return "t-rct";
    case "crown":
      return "t-crown";
    case "missing":
      return "t-missing";
    default:
      return "t-healthy";
  }
}

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
    const stateClass = mapChartState(state, isSel);

    return (
      <button
        key={num}
        type="button"
        className={cn("qf-tooth-cell", stateClass, isSel && "selected")}
        style={archStyle(archIdx, archCount, archSide, jaw)}
        onClick={() => onToggle(num)}
        aria-pressed={isSel}
        aria-label={`${lang === "ar" ? "السن" : "Tooth"} ${num}`}
      >
        {jaw === "upper" && <span className="qf-tooth-num qf-tooth-num-top">{num}</span>}
        <ToothSVG num={num} jaw={jaw} />
        {jaw === "lower" && <span className="qf-tooth-num qf-tooth-num-bottom">{num}</span>}
      </button>
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
