"use client";

import { useState, type ReactNode } from "react";
import { ToothStatusPopover } from "./dental-chart";
import { ToothCell } from "./teeth/ToothCell";
import { DENTITION_LABELS, getArchTeeth, type Dentition } from "@/lib/tooth";
import type { ToothState } from "@/types/db";

export type DentalChartRenderProps = {
  num: number;
  jaw: "upper" | "lower";
  state: ToothState;
  selected: boolean;
  dentition: Dentition;
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

function defaultRenderTooth(props: DentalChartRenderProps & { onToothClick?: (n: number) => void }) {
  const { num, jaw, state, selected, onToothClick } = props;
  return <ToothCell key={num} num={num} jaw={jaw} state={state} selected={selected} onClick={() => onToothClick?.(num)} />;
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
  onStatusChange,
  onOpenDetails,
  showStatusPopover = true,
  renderTooth,
  className = "",
}: DentalChartProps) {
  const [internalDentition, setInternalDentition] = useState<Dentition>("permanent");
  const [popoverNum, setPopoverNum] = useState<number | null>(null);
  const dentition = dentitionProp ?? internalDentition;
  const arch = getArchTeeth(dentition);
  const activePopover = showStatusPopover ? (popoverNum ?? selected) : null;

  function setDentition(d: Dentition) {
    if (onDentitionChange) onDentitionChange(d);
    else setInternalDentition(d);
  }

  function handleToothClick(n: number) {
    onToothClick?.(n);
    if (showStatusPopover) setPopoverNum(n);
  }

  function renderArchTooth(n: number, jaw: "upper" | "lower") {
    const key = String(n);
    const state = ((chart[key] as ToothState | undefined) || "healthy") as ToothState;
    const isSel = selectedList ? selectedList.includes(key) : selected === n;
    const props: DentalChartRenderProps = { num: n, jaw, state, selected: isSel, dentition };
    return renderTooth ? renderTooth(props) : defaultRenderTooth({ ...props, onToothClick: handleToothClick });
  }

  /**
   * Natural FDI order, no reversal — right quadrant then left quadrant:
   *   upper: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28
   *   lower: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38
   */
  function renderRow(jaw: "upper" | "lower", right: number[], left: number[]) {
    return (
      <div className="chart-row">
        <div className="chart-quadrant">
          {right.map((n) => (
            <div className="tooth-slot" key={n}>
              {renderArchTooth(n, jaw)}
            </div>
          ))}
        </div>
        <span className="arch-mid" aria-hidden />
        <div className="chart-quadrant">
          {left.map((n) => (
            <div className="tooth-slot" key={n}>
              {renderArchTooth(n, jaw)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`dental-chart-wrap ${className}`.trim()}>
      {showDentitionToggle && (
        <div className="dc-dentition-bar">
          {(["permanent", "deciduous"] as Dentition[]).map((d) => (
            <button key={d} type="button" className={`dc-dentition-btn${dentition === d ? " on" : ""}`} onClick={() => setDentition(d)}>
              {lang === "ar" ? DENTITION_LABELS[d].ar : DENTITION_LABELS[d].en}
            </button>
          ))}
        </div>
      )}
      <div className="dental-chart">
        <div className="dc-chart-inner">
          <div className="chart-arch upper">{renderRow("upper", arch.upperRight, arch.upperLeft)}</div>
          <div className="dc-jaw-divider" aria-hidden />
          <div className="chart-arch lower">{renderRow("lower", arch.lowerRight, arch.lowerLeft)}</div>
        </div>
      </div>
      <ToothStatusPopover
        open={activePopover != null}
        num={activePopover}
        currentState={((activePopover != null && (chart[String(activePopover)] as ToothState | undefined)) || "healthy") as ToothState}
        lang={lang}
        onSelect={(state) => {
          if (activePopover != null) {
            onStatusChange?.(activePopover, state);
            setPopoverNum(null);
          }
        }}
        onClose={() => setPopoverNum(null)}
        onDetails={
          onOpenDetails && activePopover != null
            ? () => {
                onOpenDetails(activePopover);
                setPopoverNum(null);
              }
            : undefined
        }
      />
    </div>
  );
}
