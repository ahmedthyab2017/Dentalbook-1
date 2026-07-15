"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ToothStatusPopover, buildArchLayout } from "./dental-chart";
import { ToothCell } from "./teeth/ToothCell";
import { DENTITION_LABELS, getArchTeeth, type Dentition } from "@/lib/tooth";
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
  onStatusChange?: (num: number, state: ToothState) => void;
  onOpenDetails?: (num: number) => void;
  showStatusPopover?: boolean;
  renderTooth?: (props: DentalChartRenderProps) => ReactNode;
  className?: string;
};

/** Flat schematic chart — no arch tilt (reference layout). */
export function archStyle(): CSSProperties {
  return {};
}

function quadrantStyle(count: number): CSSProperties {
  return { "--quadrant-count": count } as CSSProperties;
}

function defaultRenderTooth(props: DentalChartRenderProps & { onToothClick?: (n: number) => void; lang: "ar" | "en" }) {
  const { num, jaw, state, selected, onToothClick, lang } = props;
  return (
    <ToothCell
      key={num}
      num={num}
      jaw={jaw}
      state={state}
      selected={selected}
      lang={lang}
      archStyle={archStyle()}
      onClick={() => onToothClick?.(num)}
    />
  );
}

export function DentalChart({
  dentition: dentitionProp, onDentitionChange, showDentitionToggle = true, lang = "ar", chart = {},
  selected = null, selectedList, onToothClick, onStatusChange, onOpenDetails, showStatusPopover = true,
  renderTooth, className = "",
}: DentalChartProps) {
  const [internalDentition, setInternalDentition] = useState<Dentition>("permanent");
  const [popoverNum, setPopoverNum] = useState<number | null>(null);
  const dentition = dentitionProp ?? internalDentition;
  const arch = getArchTeeth(dentition);
  buildArchLayout(dentition);
  const isDeciduous = dentition === "deciduous";
  const activePopover = showStatusPopover ? (popoverNum ?? selected) : null;
  /** Patient view: mesial→distal from midline on each side (11–18, 41–48). */
  const upperRightDisplay = [...arch.upperRight].reverse();
  const lowerRightDisplay = [...arch.lowerRight].reverse();

  function setDentition(d: Dentition) {
    if (onDentitionChange) onDentitionChange(d);
    else setInternalDentition(d);
  }

  function handleToothClick(n: number) {
    onToothClick?.(n);
    if (showStatusPopover) setPopoverNum(n);
  }

  function renderArchTooth(n: number, jaw: "upper" | "lower", archIdx: number, archSide: "right" | "left", archCount: number) {
    const key = String(n);
    const state = ((chart[key] as ToothState | undefined) || "healthy") as ToothState;
    const isSel = selectedList ? selectedList.includes(key) : selected === n;
    const props: DentalChartRenderProps = { num: n, jaw, state, selected: isSel, dentition, archIdx, archSide, archCount };
    return renderTooth ? renderTooth(props) : defaultRenderTooth({ ...props, onToothClick: handleToothClick, lang });
  }

  return (
    <div className={`dental-chart-wrap dental-chart-light dental-chart-schematic ${className}`.trim()}>
      {showDentitionToggle && (
        <div className="dc-dentition-bar">
          {(["permanent", "deciduous"] as Dentition[]).map((d) => (
            <button key={d} type="button" className={`dc-dentition-btn${dentition === d ? " on" : ""}`} onClick={() => setDentition(d)}>
              {lang === "ar" ? DENTITION_LABELS[d].ar : DENTITION_LABELS[d].en}
            </button>
          ))}
        </div>
      )}
      <div className={`dental-chart${isDeciduous ? " dental-chart-deciduous" : ""}`}>
        <div className="dc-chart-inner">
          <div className="chart-arch upper">
            <p className="dc-arch-label">{lang === "ar" ? "الفك العلوي" : "Upper Jaw"}</p>
            <div className="chart-row">
              <div className="chart-quadrant chart-quadrant-patient-left" style={quadrantStyle(arch.upperLeft.length)}>
                {arch.upperLeft.map((n, i) => (
                  <div className="tooth-slot" key={n}>
                    {renderArchTooth(n, "upper", i, "left", arch.upperLeft.length)}
                  </div>
                ))}
              </div>
              <span className="arch-mid" aria-hidden />
              <div className="chart-quadrant chart-quadrant-patient-right" style={quadrantStyle(upperRightDisplay.length)}>
                {upperRightDisplay.map((n, i) => (
                  <div className="tooth-slot" key={n}>
                    {renderArchTooth(n, "upper", i, "right", upperRightDisplay.length)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dc-jaw-divider" aria-hidden />
          <div className="chart-arch lower">
            <div className="chart-row">
              <div className="chart-quadrant chart-quadrant-patient-left" style={quadrantStyle(arch.lowerLeft.length)}>
                {arch.lowerLeft.map((n, i) => (
                  <div className="tooth-slot" key={n}>
                    {renderArchTooth(n, "lower", i, "left", arch.lowerLeft.length)}
                  </div>
                ))}
              </div>
              <span className="arch-mid" aria-hidden />
              <div className="chart-quadrant chart-quadrant-patient-right" style={quadrantStyle(lowerRightDisplay.length)}>
                {lowerRightDisplay.map((n, i) => (
                  <div className="tooth-slot" key={n}>
                    {renderArchTooth(n, "lower", i, "right", lowerRightDisplay.length)}
                  </div>
                ))}
              </div>
            </div>
            <p className="dc-arch-label">{lang === "ar" ? "الفك السفلي" : "Lower Jaw"}</p>
          </div>
        </div>
      </div>
      <ToothStatusPopover
        open={activePopover != null}
        num={activePopover}
        currentState={((activePopover != null && (chart[String(activePopover)] as ToothState | undefined)) || "healthy") as ToothState}
        lang={lang}
        onSelect={(state) => { if (activePopover != null) { onStatusChange?.(activePopover, state); setPopoverNum(null); } }}
        onClose={() => setPopoverNum(null)}
        onDetails={onOpenDetails && activePopover != null ? () => { onOpenDetails(activePopover); setPopoverNum(null); } : undefined}
      />
    </div>
  );
}
