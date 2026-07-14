"use client";

import { useState } from "react";
import { DentalChart } from "../DentalChart";
import { ToothDetailPanel, type ToothSavePayload } from "../ToothDetailPanel";
import { useDbStore } from "@/stores/useDbStore";
import { TOOTH_STATE_COLOR, TOOTH_STATE_LABEL_AR, TOOTH_STATES } from "@/lib/tooth";
import type { Patient, ToothState } from "@/types/db";

// Ported from profChartHtml()/toothSVG()/openToothCard() (app/app.js:3690-3750).
export function ChartTab({ patient }: { patient: Patient }) {
  const updatePatient = useDbStore((s) => s.updatePatient);
  const [selected, setSelected] = useState<number | null>(null);
  const chart = patient.chart || {};
  const toothNotes = patient.toothNotes || {};

  function handleSave(payload: ToothSavePayload) {
    if (selected == null) return;
    const key = String(selected);
    updatePatient(patient.id, {
      chart: { ...chart, [key]: payload.state },
      toothNotes: { ...toothNotes, [key]: payload.note },
    });
    setSelected(null);
  }

  return (
    <>
      <DentalChart
        chart={chart}
        selected={selected}
        onToothClick={(n) => setSelected(selected === n ? null : n)}
        onStatusChange={(num, state) => {
          updatePatient(patient.id, { chart: { ...chart, [String(num)]: state } });
          setSelected(num);
        }}
        onOpenDetails={(num) => setSelected(num)}
        lang="ar"
      />
      <div className="chart-legend">
        {TOOTH_STATES.map((s) => (
          <span className="legend-item" key={s}>
            <i style={{ background: TOOTH_STATE_COLOR[s] }} /> {TOOTH_STATE_LABEL_AR[s]}
          </span>
        ))}
      </div>
      <div className="text-center mt-3 muted">اضغط على السن لعرض تفاصيله وتحديد حالته</div>

      <ToothDetailPanel
        open={selected != null}
        num={selected}
        state={((selected != null && (chart[String(selected)] as ToothState | undefined)) || "healthy") as ToothState}
        note={selected != null ? toothNotes[String(selected)] : undefined}
        lang="ar"
        onClose={() => setSelected(null)}
        onSave={handleSave}
      />
    </>
  );
}
