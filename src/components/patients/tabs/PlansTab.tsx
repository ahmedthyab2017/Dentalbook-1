"use client";

import { useState } from "react";
import { useDbStore } from "@/stores/useDbStore";
import { useQuickFlowStore } from "@/stores/useQuickFlowStore";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtMoney, fmtDateShort } from "@/lib/format";
import type { Patient, PlanStatus } from "@/types/db";

const STATUS_BADGE: Record<PlanStatus, string> = {
  active: "badge-info",
  completed: "badge-success",
  cancelled: "badge-error",
};
const STATUS_LABEL: Record<PlanStatus, string> = {
  active: "نشطة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

// Ported from profPlansHtml()/_planHistoryHtml() (app/app.js:3453-3571).
// Full QuickFlow session flow is a later phase — Start/Complete here are
// simple status-flip actions (see web/MIGRATION_NOTES.md).
export function PlansTab({ patient }: { patient: Patient }) {
  const db = useDbStore((s) => s.db);
  const addPlan = useDbStore((s) => s.addPlan);
  const updatePlan = useDbStore((s) => s.updatePlan);
  const openQf = useQuickFlowStore((s) => s.openWithPatient);
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [tooth, setTooth] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [notes, setNotes] = useState("");

  const plans = db.plans
    .filter((p) => p.ptId === patient.id)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  function startSession(planId: string) {
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) return;
    const nextIdx = plan.sessions.length;
    updatePlan(planId, {
      sessions: [...plan.sessions, { idx: nextIdx, done: true, completed: true, date: new Date().toISOString().slice(0, 10) }],
    });
  }

  function completePlan(planId: string) {
    updatePlan(planId, { status: "completed" });
  }

  function deletePlanConfirm(planId: string) {
    if (!confirm("حذف هذه الخطة؟")) return;
    updatePlan(planId, { status: "cancelled" });
  }

  function save() {
    if (!type.trim()) return;
    addPlan({
      ptId: patient.id,
      type: type.trim(),
      teeth: tooth ? [tooth.trim()] : [],
      sessions: [],
      totalCost: totalCost ? Number(totalCost) : 0,
      notes: notes.trim(),
      status: "active",
    });
    setType("");
    setTooth("");
    setTotalCost("");
    setNotes("");
    setModalOpen(false);
  }

  return (
    <>
      <div className="text-end mb-3 row gap" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={() => openQf(patient.id, patient.name)}>
          ⚡ Quick Flow
        </button>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          خطة جديدة
        </button>
      </div>

      {plans.length === 0 ? (
        <EmptyState>لا توجد خطط علاج</EmptyState>
      ) : (
        plans.map((p) => {
          const completedSessions = p.sessions.filter((s) => s.done || s.completed).length;
          const totalSessions = p.sessions.length || 1;
          const doneList = p.sessions.filter((s) => s.done || s.completed);
          return (
            <div className="plan-card" key={p.id}>
              <div className="plan-head">
                <div>
                  <div className="plan-title">{p.type}</div>
                  <div className="plan-sub">
                    السن: {p.tooth || p.teeth?.join(", ") || "—"} • التكلفة: {fmtMoney(p.totalCost)}
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
              </div>
              <div className="plan-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${((completedSessions / totalSessions) * 100).toFixed(0)}%` }}
                  />
                </div>
                <div className="progress-text">
                  {completedSessions} / {totalSessions} جلسات
                </div>
              </div>
              {p.notes && <div className="plan-notes">{p.notes}</div>}
              {doneList.length > 0 && (
                <div className="plan-history">
                  <div className="plan-history-title">📋 الأعمال المنجزة سابقاً</div>
                  {doneList.map((s, i) => (
                    <div className="plan-history-item" key={s.idx ?? i}>
                      <div className="ph-row">
                        <span className="ph-idx">جلسة {(s.idx ?? i) + 1}</span>
                        <span className="ph-date">📅 {s.date ? fmtDateShort(s.date) : "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="plan-actions">
                {p.status !== "completed" && (
                  <button className="btn btn-sm btn-primary" onClick={() => startSession(p.id)}>
                    ▶ بدء جلسة جديدة
                  </button>
                )}
                {p.status !== "completed" && (
                  <button className="btn btn-sm btn-success" onClick={() => completePlan(p.id)}>
                    إكمال
                  </button>
                )}
                <button className="btn btn-sm btn-danger" onClick={() => deletePlanConfirm(p.id)}>
                  حذف
                </button>
              </div>
            </div>
          );
        })
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="خطة علاج جديدة">
        <div className="modal-body">
          <div className="form-grid">
            <div className="field span-2">
              <label>نوع العلاج</label>
              <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="حشوة، تلبيسة، ..." />
            </div>
            <div className="field">
              <label>السن</label>
              <input type="text" value={tooth} onChange={(e) => setTooth(e.target.value)} />
            </div>
            <div className="field">
              <label>التكلفة الإجمالية</label>
              <input type="number" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} />
            </div>
            <div className="field span-2">
              <label>ملاحظات</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={save}>
            حفظ
          </button>
        </div>
      </Modal>
    </>
  );
}
