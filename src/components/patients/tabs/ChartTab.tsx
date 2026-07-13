"use client";

import { useState } from "react";
import { DentalChart } from "../DentalChart";
import { useDbStore } from "@/stores/useDbStore";
import { TOOTH_STATES, TOOTH_STATE_LABEL_AR } from "@/lib/tooth";
import type { Patient, ToothState } from "@/types/db";

// Ported from profChartHtml()/toothSVG()/openToothCard() (app/app.js:3690-3750).
export function ChartTab({ patient }: { patient: Patient }) {
  const updatePatient = useDbStore((s) => s.updatePatient);
  const [selected, setSelected] = useState<number | null>(null);
  const chart = patient.chart || {};

  function setState(num: number, state: ToothState) {
    updatePatient(patient.id, { chart: { ...chart, [num]: state } });
  }

  return (
    <>
      <DentalChart
        chart={chart}
        selected={selected}
        onToothClick={(n) => setSelected(selected === n ? null : n)}
        lang="ar"
      />
      <div className="chart-legend">
        {TOOTH_STATES.map((s) => (
          <span className={`legend-item t-${s}`} key={s}>
            <i /> {TOOTH_STATE_LABEL_AR[s]}
          </span>
        ))}
      </div>
      {selected != null && (
        <div className="tooth-pop" role="dialog" aria-label={`السن ${selected}`}>
          <div className="tooth-pop-head">
            <span>
              السن <b>{selected}</b>
            </span>
            <button className="tooth-pop-x" onClick={() => setSelected(null)}>
              ×
            </button>
          </div>
          <div className="tooth-pop-states">
            {TOOTH_STATES.map((s) => (
              <button
                key={s}
                className={`tp-state t-${s}${(chart[String(selected)] || "healthy") === s ? " on" : ""}`}
                onClick={() => setState(selected, s)}
              >
                <i />
                <span>{TOOTH_STATE_LABEL_AR[s]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="text-center mt-3 muted">اضغط على السن لتحديد حالته</div>
    </>
  );
}
