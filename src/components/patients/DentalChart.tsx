"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ToothCell } from "./teeth/ToothCell";
import { ToothDefs } from "./teeth/ToothDefs";
import {
  DENTITION_LABELS,
  TOOTH_TYPE_LABELS,
  getArchTeeth,
  type Dentition,
} from "@/lib/tooth";
import type { ToothState } from "@/types/db";

export type DentalChartRenderProps = {
  num: number;
  jaw: "upper" | "lower";
  state: ToothState;
  selected: boolean;
  dentition: Dentition;
  archIdx: number;
  archSide: "right" | "left";
  archCount: number;
};

type DentalChartProps = {
  dentition?: Dentition;
  onDentitionChange?: (d: Dentition) => void;
  showDentitionToggle?: boolean;
  lang?: "ar" | "en";
  chart?: Record<string, ToothState | string>;
  selected?: number | null;
  selectedList?: string[];
  onToothClick?: (num: number) => void;
  renderTooth?: (props: DentalChartRenderProps) => ReactNode;
  className?: string;
};

/**
 * Places a tooth along a natural elliptical dental-arch curve: teeth near
 * the midline (incisors) sit almost flat, while posterior teeth (molars)
 * rise and tilt outward — like a real jaw arch rather than a straight row.
 * Horizontal spacing is left to the flex layout; this only supplies the
 * curvature (vertical rise + rotation).
 */
export function archStyle(
  idx: number,
  count: number,
  side: "right" | "left",
  jaw: "upper" | "lower",
): CSSProperties {
  const fromMid = side === "right" ? count - 1 - idx : idx;
  const sign = side === "right" ? 1 : -1;
  const jawSign = jaw === "upper" ? 1 : -1;
  const t = count > 1 ? fromMid / (count - 1) : 0;
  const maxAngle = 34; // degrees of arc sweep from midline to the last molar
  const angleDeg = t * maxAngle;
  const angleRad = (angleDeg * Math.PI) / 180;
  const archRadius = 52; // px — controls how dramatically the arch rises
  const tilt = sign * angleDeg * 0.62;
  const lift = archRadius * (1 - Math.cos(angleRad)) * jawSign;
  const outward = Math.sin(angleRad) * 3 * jawSign;
  return {
    "--arch-tilt": `${tilt}deg`,
    "--arch-lift": `${lift}px`,
    "--arch-out": `${outward}px`,
  } as CSSProperties;
}

function defaultRenderTooth({
  num,
  jaw,
  state,
  selected,
  onToothClick,
  archIdx,
  archSide,
  archCount,
}: DentalChartRenderProps & { onToothClick?: (n: number) => void }) {
  return (
    <ToothCell
      key={num}
      num={num}
      jaw={jaw}
      state={state}
      selected={selected}
      archStyle={archStyle(archIdx, archCount, archSide, jaw)}
      onClick={() => onToothClick?.(num)}
    />
  );
}

export function DentalChart({
  dentition: dentitionProp,
  onDentitionChange,
  showDentitionToggle = true,
  lang = "ar",
  chart = {},
  selected = null,
  selectedList,
  onToothClick,
  renderTooth,
  className = "",
}: DentalChartProps) {
  const [internalDentition, setInternalDentition] = useState<Dentition>("permanent");
  const dentition = dentitionProp ?? internalDentition;
  const arch = getArchTeeth(dentition);
  const isDeciduous = dentition === "deciduous";

  function setDentition(d: Dentition) {
    if (onDentitionChange) onDentitionChange(d);
    else setInternalDentition(d);
  }

  function renderArchTooth(n: number, jaw: "upper" | "lower", archIdx: number, archSide: "right" | "left", archCount: number) {
    const key = String(n);
    const state = ((chart[key] as ToothState | undefined) || "healthy") as ToothState;
    const isSel = selectedList ? selectedList.includes(key) : selected === n;
    const props: DentalChartRenderProps = {
      num: n,
      jaw,
      state,
      selected: isSel,
      dentition,
      archIdx,
      archSide,
      archCount,
    };

    if (renderTooth) return renderTooth(props);
    return defaultRenderTooth({ ...props, onToothClick });
  }

  return (
    <div className={`dental-chart-wrap ${className}`.trim()}>
      <ToothDefs />
      {showDentitionToggle && (
        <div className="dc-dentition-bar">
          {(["permanent", "deciduous"] as Dentition[]).map((d) => (
            <button
              key={d}
              type="button"
              className={`dc-dentition-btn${dentition === d ? " on" : ""}`}
              onClick={() => setDentition(d)}
            >
              {lang === "ar" ? DENTITION_LABELS[d].ar : DENTITION_LABELS[d].en}
            </button>
          ))}
        </div>
      )}

      <div className={`dental-chart${isDeciduous ? " dental-chart-deciduous" : ""}`}>
        <div className="dc-chart-inner">
          <div className="chart-arch upper">
            <div className="chart-row">
              {arch.upperRight.map((n, i) => renderArchTooth(n, "upper", i, "right", arch.upperRight.length))}
              <span className="arch-mid" />
              {arch.upperLeft.map((n, i) => renderArchTooth(n, "upper", i, "left", arch.upperLeft.length))}
            </div>
          </div>

          <div className="dc-jaw-divider">
            <div className="dc-jaw-line">
              <span>{lang === "ar" ? "الفك العلوي" : "Upper Jaw"}</span>
            </div>
            <span className="dc-jaw-plus" aria-hidden>
              +
            </span>
            <div className="dc-jaw-line">
              <span>{lang === "ar" ? "الفك السفلي" : "Lower Jaw"}</span>
            </div>
          </div>

          <div className="chart-arch lower">
            <div className="chart-row">
              {arch.lowerRight.map((n, i) => renderArchTooth(n, "lower", i, "right", arch.lowerRight.length))}
              <span className="arch-mid" />
              {arch.lowerLeft.map((n, i) => renderArchTooth(n, "lower", i, "left", arch.lowerLeft.length))}
            </div>
          </div>
        </div>
      </div>

      <div className="dc-type-legend">
        {(["central", "lateral", "canine", ...(isDeciduous ? [] : (["premolar"] as const)), "molar"] as const).map(
          (type) => (
            <span className={`dc-type-item dc-type-${type}`} key={type}>
              <i aria-hidden />
              {lang === "ar" ? TOOTH_TYPE_LABELS[type].ar : TOOTH_TYPE_LABELS[type].en}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
