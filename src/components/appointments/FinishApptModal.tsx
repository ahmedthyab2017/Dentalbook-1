"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDbStore } from "@/stores/useDbStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { fmtMoney, initials, todayStr } from "@/lib/format";
import type { AppointmentStatus } from "@/types/db";

type FinishReason = "completed" | "partial" | "left" | "medical" | "noshow" | "other";
type DebtDecision = "keep" | "paynow" | "waive" | "later";

const REASON_CHIPS: { id: FinishReason; ar: string; en: string }[] = [
  { id: "completed", ar: "✅ اكتملت", en: "✅ Completed" },
  { id: "partial", ar: "⏸ مكتملة جزئياً", en: "⏸ Partial" },
  { id: "left", ar: "🚪 المريض غادر", en: "🚪 Patient left" },
  { id: "medical", ar: "⚠️ مشكلة طبية", en: "⚠️ Medical issue" },
  { id: "noshow", ar: "👻 لم يحضر", en: "👻 No-show" },
  { id: "other", ar: "📝 أخرى", en: "📝 Other" },
];

const DEBT_CHIPS: { id: DebtDecision; ar: string; en: string }[] = [
  { id: "keep", ar: "📌 يبقى ديناً", en: "📌 Keep as debt" },
  { id: "paynow", ar: "💵 سيُدفع الآن", en: "💵 Pay now" },
  { id: "waive", ar: "🎁 تنازل/خصم", en: "🎁 Waive/discount" },
  { id: "later", ar: "⏰ يُسدد لاحقاً", en: "⏰ Pay later" },
];

const PAY_CHIPS = [5000, 10000, 25000, 50000, 100000, 250000, 500000];

export function FinishApptModal({
  apptId,
  open,
  onClose,
}: {
  apptId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const db = useDbStore((s) => s.db);
  const updateAppointment = useDbStore((s) => s.updateAppointment);
  const addPayment = useDbStore((s) => s.addPayment);
  const updatePlan = useDbStore((s) => s.updatePlan);

  const appt = apptId ? db.appointments.find((a) => a.id === apptId) : null;
  const pt = appt ? db.patients.find((p) => p.id === appt.ptId) : null;

  const [reason, setReason] = useState<FinishReason>("completed");
  const [debtDecision, setDebtDecision] = useState<DebtDecision>("keep");
  const [amountPaid, setAmountPaid] = useState(0);
  const [note, setNote] = useState("");

  const totalDebt = useMemo(() => {
    if (!appt) return 0;
    const activePlans = db.plans.filter((p) => p.ptId === appt.ptId && p.status === "active");
    return activePlans.reduce((sum, p) => {
      const total = Number(p.totalCost) || 0;
      const paid = db.payments.filter((pay) => pay.planId === p.id).reduce((s, x) => s + (Number(x.amount) || 0), 0);
      return sum + Math.max(0, total - paid);
    }, 0);
  }, [appt, db.plans, db.payments]);

  if (!open || !appt || !pt) return null;

  function confirm() {
    const status: AppointmentStatus =
      reason === "noshow" ? "cancelled" : reason === "completed" ? "completed" : "completed";

    updateAppointment(appt!.id, {
      status,
      finishReason: reason,
      finishNote: note.trim(),
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (debtDecision === "paynow" && amountPaid > 0) {
      const activePlans = db.plans
        .filter((p) => p.ptId === appt!.ptId && p.status === "active")
        .sort((x, y) => (x.createdAt || 0) - (y.createdAt || 0));
      const targetPlan = activePlans[0];
      addPayment({
        ptId: appt!.ptId,
        amount: amountPaid,
        date: todayStr(),
        method: "cash",
        note: note.trim() || L("دفعة الإنهاء", "Finish payment", lang),
        planId: targetPlan?.id,
      });
    } else if (debtDecision === "waive") {
      db.plans
        .filter((p) => p.ptId === appt!.ptId && p.status === "active")
        .forEach((p) => {
          const total = Number(p.totalCost) || 0;
          const paid = db.payments.filter((pay) => pay.planId === p.id).reduce((s, x) => s + (Number(x.amount) || 0), 0);
          const debt = total - paid;
          if (debt > 0) {
            updatePlan(p.id, {
              totalCost: paid,
              status: "completed",
              completedAt: Date.now(),
              discounts: [
                ...(p.discounts || []),
                { amount: debt, reason: "waive at finish", at: Date.now() },
              ],
            });
          }
        });
    }

    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={L("إنهاء الجلسة", "Finish Session", lang)}>
      <div className="modal-body">
        <div className="qf-pt-pill">
          <div className="qf-pt-avatar">{initials(pt.name)}</div>
          <div>
            <b>{pt.name}</b>
            <div className="muted" style={{ fontSize: "11.5px" }}>
              {appt.time || ""} · {appt.note || appt.purpose || ""}
            </div>
          </div>
        </div>

        <div className="qf-section-title">{L("سبب الإنهاء", "Finish Reason", lang)}</div>
        <div className="finish-reason-grid">
          {REASON_CHIPS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`finish-reason-chip${reason === r.id ? " active" : ""}`}
              onClick={() => setReason(r.id)}
            >
              {L(r.ar, r.en, lang)}
            </button>
          ))}
        </div>

        {totalDebt > 0 ? (
          <>
            <div className="qf-section-title">
              💰 {L(`المبلغ المتبقي (${fmtMoney(totalDebt)})`, `Outstanding (${fmtMoney(totalDebt)})`, lang)}
            </div>
            <div className="finish-debt-row">
              {DEBT_CHIPS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`finish-debt-chip${debtDecision === d.id ? " active" : ""}`}
                  onClick={() => {
                    setDebtDecision(d.id);
                    if (d.id !== "paynow") setAmountPaid(0);
                  }}
                >
                  {L(d.ar, d.en, lang)}
                </button>
              ))}
            </div>
            {debtDecision === "paynow" && (
              <>
                <div className="qf-amt-display">{fmtMoney(amountPaid)}</div>
                <div className="qf-amt-chips">
                  {[...PAY_CHIPS, totalDebt].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="qf-amt-chip plus"
                      onClick={() => setAmountPaid((v) => Math.max(0, v + amt))}
                    >
                      {amt === totalDebt ? L("الكامل", "Full", lang) : `+${amt / 1000}k`}
                    </button>
                  ))}
                  <button type="button" className="qf-amt-chip clear" onClick={() => setAmountPaid(0)}>
                    ↺
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="qf-empty">✓ {L("لا يوجد دين متبقٍ", "No outstanding debt", lang)}</div>
        )}

        <div className="qf-section-title">📝 {L("ملاحظة (اختياري)", "Note (optional)", lang)}</div>
        <textarea
          className="qf-note-input"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={L("أي ملاحظة عن الإنهاء…", "Any note about this finish…", lang)}
        />
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>
          {L("إلغاء", "Cancel", lang)}
        </button>
        <button className="btn btn-primary" onClick={confirm}>
          {L("✓ إنهاء الجلسة", "✓ Finish Session", lang)}
        </button>
      </div>
    </Modal>
  );
}
