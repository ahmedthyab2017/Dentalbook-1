"use client";

import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { qfTreatmentOptions } from "@/lib/quickflow-treatments";
import { QfAmountStepper } from "./QfAmountStepper";
import type { DentistDb } from "@/types/db";
import type { QfSelectedTooth } from "@/types/quickflow";

export function QfSelectedTeethPanel({
  db,
  teeth,
  amountPaid,
  onAmountPaidChange,
  onUpdateTooth,
  onRemoveTooth,
  showTotalPaid = true,
  isComplex = false,
}: {
  db: DentistDb;
  teeth: QfSelectedTooth[];
  amountPaid?: number;
  onAmountPaidChange?: (n: number) => void;
  onUpdateTooth: (idx: number, patch: Partial<QfSelectedTooth>) => void;
  onRemoveTooth: (tooth: string) => void;
  showTotalPaid?: boolean;
  isComplex?: boolean;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const options = qfTreatmentOptions(db, lang);

  if (!teeth.length) {
    return (
      <div className="qf-empty muted">
        {L("لم تُختر أسنان بعد", "No teeth selected yet", lang)}
      </div>
    );
  }

  return (
    <>
      <div className="qf-section-title">
        {L(`الأسنان المختارة (${teeth.length})`, `Selected Teeth (${teeth.length})`, lang)}
      </div>
      <div className="qf-tooth-config-list">
        {teeth.map((t, idx) => (
          <div className="qf-tooth-cfg" key={t.tooth}>
            <div className="qf-tooth-cfg-head">
              <span className="qf-tooth-badge">🦷 {t.tooth}</span>
              <button type="button" className="link-btn" onClick={() => onRemoveTooth(t.tooth)}>
                ✕
              </button>
            </div>
            <div className="qf-tx-chips">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`qf-tx-chip${t.treatmentId === opt.id ? " active" : ""}`}
                  onClick={() =>
                    onUpdateTooth(idx, {
                      treatmentId: opt.id,
                      cost: opt.cost,
                      sessions: opt.sessions,
                    })
                  }
                >
                  {opt.name}
                </button>
              ))}
            </div>
            {t.treatmentId ? (
              <div className="qf-tooth-amounts">
                <div className="field">
                  <label>{L("الكلفة الكلية للسن", "Cost", lang)}</label>
                  <QfAmountStepper value={t.cost} onChange={(n) => onUpdateTooth(idx, { cost: n })} />
                </div>
                {!isComplex && (
                  <div className="field">
                    <label>{L("عدد الجلسات", "Sessions", lang)}</label>
                    <div className="qf-num-step">
                      <button type="button" onClick={() => onUpdateTooth(idx, { sessions: Math.max(1, (t.sessions || 1) - 1) })}>
                        −
                      </button>
                      <span>
                        <b>{t.sessions || 1}</b>
                      </span>
                      <button type="button" onClick={() => onUpdateTooth(idx, { sessions: (t.sessions || 1) + 1 })}>
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 12, padding: "6px 4px" }}>
                {L("↑ اختر العلاج بالأعلى", "↑ Pick treatment above", lang)}
              </div>
            )}
          </div>
        ))}
      </div>
      {showTotalPaid && onAmountPaidChange != null && (
        <>
          <div className="qf-section-title">
            💰 {L("إجمالي المبلغ المسدد اليوم", "Total Paid Today", lang)}
          </div>
          <QfAmountStepper value={amountPaid || 0} onChange={onAmountPaidChange} />
        </>
      )}
    </>
  );
}
