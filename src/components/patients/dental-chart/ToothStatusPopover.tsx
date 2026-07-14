"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TOOTH_STATE_COLOR, TOOTH_STATE_LABEL_AR, TOOTH_STATE_LABEL_EN, TOOTH_STATES } from "@/lib/tooth";
import type { ToothState } from "@/types/db";

export function ToothStatusPopover({
  open, num, currentState, lang = "ar", onSelect, onClose, onDetails,
}: {
  open: boolean;
  num: number | null;
  currentState: ToothState;
  lang?: "ar" | "en";
  onSelect: (state: ToothState) => void;
  onClose: () => void;
  onDetails?: () => void;
}) {
  const labels = lang === "ar" ? TOOTH_STATE_LABEL_AR : TOOTH_STATE_LABEL_EN;

  return (
    <AnimatePresence>
      {open && num != null && (
        <>
          <motion.button type="button" className="dc-popover-backdrop" aria-label="Close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="dc-tooth-popover" role="dialog" initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.18 }}>
            <div className="dc-popover-head">
              <strong>{lang === "ar" ? `السن ${num}` : `Tooth ${num}`}</strong>
              <button type="button" className="dc-popover-close" onClick={onClose}>×</button>
            </div>
            <p className="dc-popover-hint">{lang === "ar" ? "اختر الحالة السريرية" : "Select clinical status"}</p>
            <div className="dc-popover-grid">
              {TOOTH_STATES.map((s) => (
                <button key={s} type="button" className={`dc-popover-status${currentState === s ? " on" : ""}`} onClick={() => onSelect(s)}>
                  <i style={{ background: TOOTH_STATE_COLOR[s] }} aria-hidden />
                  {labels[s]}
                </button>
              ))}
            </div>
            {onDetails && (
              <button type="button" className="dc-popover-details" onClick={onDetails}>
                {lang === "ar" ? "تفاصيل وملاحظات ←" : "Notes & details →"}
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
