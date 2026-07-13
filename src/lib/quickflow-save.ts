import type { DentistDb } from "@/types/db";
import { uid } from "@/lib/id";
import { todayStr } from "@/lib/format";
import type { QuickFlowState } from "@/types/quickflow";

export interface QfSaveResult {
  savedPlanIds: string[];
  message: string;
}

export function applyQuickFlowSave(
  db: DentistDb,
  state: QuickFlowState,
  doctorId?: string
): { db: DentistDb; result: QfSaveResult } {
  const s = state;
  const next: DentistDb = JSON.parse(JSON.stringify(db));
  const savedPlanIds: string[] = [];
  const today = todayStr();

  if (s.action === "continue" && s.planId) {
    const plan = next.plans.find((p) => p.id === s.planId);
    if (plan) {
      if (s.paymentOnlyMode) {
        if (s.amountPaid > 0) {
          next.payments.push({
            id: uid("py_"),
            ptId: s.ptId,
            amount: s.amountPaid,
            date: today,
            method: "cash",
            note: s.noteText || "دفعة إضافية",
            planId: s.planId,
            createdAt: Date.now(),
          });
        }
        const paidTotal = next.payments
          .filter((p) => p.planId === plan.id)
          .reduce((a, b) => a + (Number(b.amount) || 0), 0);
        if (paidTotal >= (Number(plan.totalCost) || 0)) plan.status = "completed";
      } else if (plan.sessions[s.sessionIdx]) {
        const sess = plan.sessions[s.sessionIdx];
        sess.done = s.sessionDone;
        sess.completed = s.sessionDone;
        if (s.sessionDone) sess.date = today;
        sess.paid = (Number(sess.paid) || 0) + (Number(s.amountPaid) || 0);
        sess.notes = ((sess.notes || "") + " " + (s.noteText || "")).trim();
        if (s.sessionExtraAmount > 0) {
          plan.totalCost = (Number(plan.totalCost) || 0) + s.sessionExtraAmount;
        }
        if (s.amountPaid > 0) {
          next.payments.push({
            id: uid("py_"),
            ptId: s.ptId,
            amount: s.amountPaid,
            date: today,
            method: "cash",
            note: s.noteText || "",
            planId: s.planId,
            sessionIdx: s.sessionIdx,
            createdAt: Date.now(),
          });
        }
        const allDone = plan.sessions.every((ss) => ss.done || ss.completed);
        const paidTotal = next.payments
          .filter((p) => p.planId === plan.id)
          .reduce((a, b) => a + (Number(b.amount) || 0), 0);
        if (allDone && paidTotal >= (Number(plan.totalCost) || 0)) plan.status = "completed";
      }
      savedPlanIds.push(plan.id);
    }
  } else if (s.action === "new") {
    const byTx: Record<string, { teeth: string[]; cost: number; sessions: number }> = {};
    s.selectedTeeth.forEach((t) => {
      if (!t.treatmentId) return;
      if (!byTx[t.treatmentId]) byTx[t.treatmentId] = { teeth: [], cost: 0, sessions: 1 };
      byTx[t.treatmentId].teeth.push(t.tooth);
      byTx[t.treatmentId].cost += Number(t.cost) || 0;
      byTx[t.treatmentId].sessions = Math.max(byTx[t.treatmentId].sessions, t.sessions || 1);
    });
    Object.keys(byTx).forEach((tid) => {
      const grp = byTx[tid];
      const firstDone = s.firstSessionDone;
      const plan = {
        id: uid("pl_"),
        ptId: s.ptId,
        type: tid,
        teeth: grp.teeth,
        doctorId,
        totalCost: grp.cost,
        sessions: Array.from({ length: grp.sessions }, (_, i) => ({
          idx: i,
          done: i === 0 && firstDone,
          completed: i === 0 && firstDone,
          date: i === 0 && firstDone ? today : "",
          paid: 0,
          notes: "",
        })),
        notes: s.noteText || "",
        createdAt: Date.now(),
        status: "active" as const,
      };
      next.plans.push(plan);
      savedPlanIds.push(plan.id);
    });
    if (s.amountPaid > 0 && savedPlanIds.length) {
      const grandTotal =
        savedPlanIds.reduce((acc, pid) => {
          const pl = next.plans.find((p) => p.id === pid);
          return acc + (Number(pl?.totalCost) || 0);
        }, 0) || 1;
      let allocated = 0;
      savedPlanIds.forEach((pid, i) => {
        const pl = next.plans.find((p) => p.id === pid);
        if (!pl) return;
        const share =
          i === savedPlanIds.length - 1
            ? s.amountPaid - allocated
            : Math.round(((Number(pl.totalCost) || 0) / grandTotal) * s.amountPaid);
        if (share > 0) {
          next.payments.push({
            id: uid("py_"),
            ptId: s.ptId,
            amount: share,
            date: today,
            method: "cash",
            note: s.noteText || "",
            planId: pid,
            sessionIdx: 0,
            createdAt: Date.now(),
          });
          if (pl.sessions[0]) pl.sessions[0].paid = (Number(pl.sessions[0].paid) || 0) + share;
          allocated += share;
        }
      });
    }
  } else if (s.action === "complex") {
    const teeth = s.selectedTeeth.map((t) => t.tooth);
    const planType =
      s.complexCategory === "implant" ? "implant" : s.complexCategory === "ortho" ? "ortho" : "veneer";
    const sessionCount = Math.max(1, s.sessionsExpected);
    const firstDone = s.firstSessionDone;
    const plan = {
      id: uid("pl_"),
      ptId: s.ptId,
      type: planType,
      teeth,
      doctorId,
      totalCost: s.totalCost,
      sessions: Array.from({ length: sessionCount }, (_, i) => ({
        idx: i,
        done: i === 0 && firstDone,
        completed: i === 0 && firstDone,
        date: i === 0 && firstDone ? today : "",
        paid: 0,
        notes: "",
      })),
      notes: [s.noteText, s.complexClass].filter(Boolean).join(" — "),
      createdAt: Date.now(),
      status: "active" as const,
    };
    next.plans.push(plan);
    savedPlanIds.push(plan.id);
    if (s.amountPaid > 0) {
      next.payments.push({
        id: uid("py_"),
        ptId: s.ptId,
        amount: s.amountPaid,
        date: today,
        method: "cash",
        note: s.noteText || "",
        planId: plan.id,
        sessionIdx: 0,
        createdAt: Date.now(),
      });
      if (plan.sessions[0]) plan.sessions[0].paid = s.amountPaid;
    }
    next.cases.push({
      id: uid("cs_"),
      ptId: s.ptId,
      ptName: s.ptName,
      category: s.complexCategory,
      treatmentType: s.complexClass || planType,
      date: today,
      notes: s.noteText || "",
      photosBefore: [],
      photosAfter: [],
      createdAt: Date.now(),
    });
  } else if (s.action === "rxOnly" && s.rxMedName) {
    next.prescriptions.push({
      id: uid("rx_"),
      ptId: s.ptId,
      date: today,
      meds: [{ name: s.rxMedName, dose: s.rxDose || "", duration: s.rxDuration || "" }],
      notes: s.noteText || "",
      createdAt: Date.now(),
    });
  } else if (s.action === "apptOnly") {
    next.appointments.push({
      id: uid("a_"),
      ptId: s.ptId,
      date: s.apptDate || today,
      time: s.apptTime || "10:00",
      purpose: s.apptPurpose || "متابعة",
      status: "scheduled",
      note: s.noteText || "",
      createdAt: Date.now(),
    });
  }

  if (s.reminder) {
    next.reminders.push({
      id: uid("rm_"),
      ptId: s.ptId,
      ptName: s.ptName,
      content: s.reminder.content || s.noteText || "تذكير متابعة",
      dueAt: s.reminder.dueAt,
      recipients: s.reminder.recipients.length ? s.reminder.recipients : ["inApp"],
      done: false,
      createdAt: Date.now(),
    });
  } else if (s.reminderText && s.reminderDue) {
    next.reminders.push({
      id: uid("rm_"),
      ptId: s.ptId,
      ptName: s.ptName,
      content: s.reminderText,
      dueAt: new Date(s.reminderDue).getTime(),
      recipients: ["inApp"],
      done: false,
      createdAt: Date.now(),
    });
  }

  return {
    db: next,
    result: { savedPlanIds, message: "تم الحفظ بنجاح" },
  };
}
