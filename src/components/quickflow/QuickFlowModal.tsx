"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Zap, X } from "lucide-react";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useQuickFlowStore } from "@/stores/useQuickFlowStore";
import { applyQuickFlowSave } from "@/lib/quickflow-save";
import { QfStep4 } from "@/components/quickflow/QfStep4";
import { createQuickFlowState, type QuickFlowState, type QfAction, type QfSelectedTooth } from "@/types/quickflow";
import { todayStr, fmtMoney } from "@/lib/format";
import { QfDentalChart } from "@/components/quickflow/QfDentalChart";
import { QfAmountStepper } from "@/components/quickflow/QfAmountStepper";
import { QfSelectedTeethPanel } from "@/components/quickflow/QfSelectedTeethPanel";
import { QfVoiceNote } from "@/components/quickflow/QfVoiceNote";
import { QfReminderSection } from "@/components/quickflow/QfReminderSection";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { Modal, ModalBody, ModalFooter, Button, SearchInput, Avatar, IconButton, Input, Select, Badge } from "@/components/ds";
import { cn } from "@/lib/cn";
import "./qf-ds.css";

function createInitialQfState(presetPtId?: string | null, presetPtName?: string | null): QuickFlowState {
  if (presetPtId && presetPtName) {
    return { ...createQuickFlowState(), ptId: presetPtId, ptName: presetPtName, step: 2 };
  }
  return createQuickFlowState();
}

export function QuickFlowModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const presetPtId = useQuickFlowStore((s) => s.presetPtId);
  const presetPtName = useQuickFlowStore((s) => s.presetPtName);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      className={cn(
        "flex max-h-[min(92dvh,900px)] flex-col overflow-hidden p-0",
        "max-sm:fixed max-sm:inset-0 max-sm:h-[100dvh] max-sm:max-h-none max-sm:max-w-none max-sm:rounded-none"
      )}
    >
      {open && (
        <QuickFlowModalBody
          key={`${presetPtId ?? ""}|${presetPtName ?? ""}`}
          presetPtId={presetPtId}
          presetPtName={presetPtName}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function QuickFlowModalBody({
  presetPtId,
  presetPtName,
  onClose,
}: {
  presetPtId?: string | null;
  presetPtName?: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const replaceDb = useDbStore((s) => s.replaceDb);
  const addPatient = useDbStore((s) => s.addPatient);
  const user = useSessionStore((s) => s.user);

  const [state, setState] = useState<QuickFlowState>(() =>
    createInitialQfState(presetPtId, presetPtName)
  );

  const reset = useCallback(() => {
    setState(createQuickFlowState());
  }, []);

  const close = () => {
    reset();
    onClose();
  };

  function patch(p: Partial<QuickFlowState>) {
    setState((s) => ({ ...s, ...p }));
  }

  function pickPt(ptId: string, ptName: string) {
    patch({ ptId, ptName, step: 2, newPtDraft: null });
  }

  function saveNewPt() {
    const d = state.newPtDraft;
    if (!d?.name.trim() || !d.phone.trim()) {
      alert("الاسم والهاتف مطلوبان");
      return;
    }
    const pt = addPatient({
      name: d.name.trim(),
      phone: d.phone.trim(),
      age: d.age ? Number(d.age) : undefined,
      gender: d.gender,
      allergies: d.allergies.trim(),
      medical: d.medical.trim(),
      notes: "",
      chart: {},
    });
    pickPt(pt.id, pt.name);
  }

  function continuePlan(planId: string) {
    const plan = db.plans.find((p) => p.id === planId);
    if (!plan) return;
    const sessions = plan.sessions || [];
    let nextIdx = sessions.findIndex((s) => !(s.done || s.completed));
    let paymentOnlyMode = false;
    if (nextIdx === -1) {
      const total = Number(plan.totalCost) || 0;
      const paid = db.payments.filter((p) => p.planId === plan.id).reduce((a, b) => a + (Number(b.amount) || 0), 0);
      if (total - paid > 0) {
        nextIdx = sessions.length - 1;
        paymentOnlyMode = true;
      } else {
        replaceDb({
          ...db,
          plans: db.plans.map((p) => (p.id === planId ? { ...p, status: "completed" as const } : p)),
        });
        alert("كل الجلسات منجزة ومدفوعة — الخطة مكتملة");
        close();
        return;
      }
    }
    patch({ action: "continue", planId, sessionIdx: nextIdx, paymentOnlyMode, step: 3 });
  }

  function pickAction(action: QfAction) {
    if (action === "rxOnly" || action === "apptOnly") {
      patch({
        action,
        step: 3,
        apptDate: todayStr(),
      });
      return;
    }
    patch({ action, step: 3 });
  }

  function toggleTooth(num: number) {
    const tooth = String(num);
    const idx = state.selectedTeeth.findIndex((t) => t.tooth === tooth);
    if (idx === -1) {
      patch({
        selectedTeeth: [...state.selectedTeeth, { tooth, treatmentId: "", cost: 0, sessions: 1 }],
        activeTooth: tooth,
      });
    } else {
      patch({
        selectedTeeth: state.selectedTeeth.filter((t) => t.tooth !== tooth),
        activeTooth: state.activeTooth === tooth ? null : state.activeTooth,
      });
    }
  }

  function updateTooth(idx: number, p: Partial<QfSelectedTooth>) {
    patch({
      selectedTeeth: state.selectedTeeth.map((t, i) => (i === idx ? { ...t, ...p } : t)),
    });
  }

  function removeTooth(tooth: string) {
    toggleTooth(Number(tooth));
  }

  function save() {
    if (state.action === "new" && !state.selectedTeeth.some((t) => t.treatmentId)) {
      alert("اختر سناً واحداً على الأقل وحدّد نوع العلاج لكل سن");
      return;
    }
    if (state.action === "complex" && !(state.totalCost > 0)) {
      alert("الكلفة الإجمالية مطلوبة");
      return;
    }
    const { db: nextDb, result } = applyQuickFlowSave(db, state, user?.id);
    replaceDb(nextDb);
    if (state.action === "rxOnly" || state.action === "apptOnly") {
      alert(result.message);
      close();
      return;
    }
    patch({ step: 4, savedPlanIds: result.savedPlanIds, rxSuggestedType: getSuggestedType(state, db) });
  }

  function getSuggestedType(s: QuickFlowState, d: typeof db): string {
    if (s.action === "new" && s.selectedTeeth[0]) return s.selectedTeeth[0].treatmentId || "other";
    if (s.action === "complex") {
      return s.complexCategory === "implant" ? "implant" : s.complexCategory === "ortho" ? "ortho" : "veneer";
    }
    if (s.action === "continue" && s.planId) {
      const pl = d.plans.find((p) => p.id === s.planId);
      if (pl) return pl.type;
    }
    return "other";
  }

  const stepNum = Math.min(state.step, 3);
  const showFooter = Boolean(state.newPtDraft || state.step === 3);

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 bg-gradient-to-br from-primary to-primary-hover px-5 py-4 text-white sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Zap className="h-5 w-5 shrink-0 text-white/90" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">Quick Flow</p>
            <p className="truncate text-xs text-white/75">تدفق الإنجاز السريع</p>
          </div>
        </div>
        {state.step <= 3 && (
          <Badge variant="secondary" className="shrink-0 border-white/20 bg-white/15 text-white">
            {stepNum} / 3
          </Badge>
        )}
        <IconButton
          label="إغلاق"
          onClick={close}
          className="shrink-0 text-white hover:bg-white/15"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <ModalBody className="qf-ds flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        {state.newPtDraft ? (
          <NewPtPanel draft={state.newPtDraft} onChange={(d) => patch({ newPtDraft: d })} />
        ) : state.step === 1 ? (
          <Step1 state={state} db={db} onSearch={(q) => patch({ searchQ: q })} onPick={pickPt} onNewPt={() => patch({ newPtDraft: { name: "", phone: "", age: "", gender: "male", allergies: "", medical: "" } })} />
        ) : state.step === 2 ? (
          <Step2 state={state} db={db} onBack={() => patch({ step: 1 })} onContinue={continuePlan} onAction={pickAction} />
        ) : state.step === 3 ? (
          <Step3
            state={state}
            db={db}
            onPatch={patch}
            onToggleTooth={toggleTooth}
            onUpdateTooth={updateTooth}
            onRemoveTooth={removeTooth}
          />
        ) : (
          <QfStep4
            state={state}
            onPatch={patch}
            onClose={close}
            onProfile={() => {
              router.push(`/patients/${state.ptId}`);
              close();
            }}
            onBackToStep3={() => patch({ step: 3 })}
            onPark={() => {
              patch(createQuickFlowState());
            }}
          />
        )}
      </ModalBody>

      {showFooter && (
        <ModalFooter className="qf-ds shrink-0 bg-border-subtle/50">
          {state.newPtDraft ? (
            <>
              <Button variant="ghost" onClick={() => patch({ newPtDraft: null })}>
                ← رجوع
              </Button>
              <Button onClick={saveNewPt}>حفظ ومتابعة</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => patch({ step: 2 })}>
                ← رجوع
              </Button>
              <Button onClick={save}>💾 حفظ</Button>
            </>
          )}
        </ModalFooter>
      )}
    </>
  );
}

function Step1({
  state,
  db,
  onSearch,
  onPick,
  onNewPt,
}: {
  state: QuickFlowState;
  db: ReturnType<typeof useDbStore.getState>["db"];
  onSearch: (q: string) => void;
  onPick: (id: string, name: string) => void;
  onNewPt: () => void;
}) {
  const today = todayStr();
  const q = state.searchQ.toLowerCase();
  const todayAppts = db.appointments
    .filter((a) => a.date === today && a.status !== "cancelled" && a.status !== "completed")
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  let suggestions = [...db.patients].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);
  if (q.trim()) {
    suggestions = db.patients
      .filter((p) => p.name.toLowerCase().includes(q) || (p.phone || "").includes(state.searchQ))
      .slice(0, 10);
  }

  return (
    <>
      <div className="qf-step-title">الخطوة 1: اختر المريض</div>
      <SearchInput
        placeholder="بحث بالاسم أو الهاتف..."
        value={state.searchQ}
        onChange={(e) => onSearch(e.target.value)}
        className="mb-3 max-w-none"
      />
      <Button className="mb-4 w-full" onClick={onNewPt}>
        + مريض جديد
      </Button>
      {todayAppts.length > 0 && (
        <>
          <div className="qf-section-title">📅 مواعيد اليوم</div>
          <div className="qf-pt-list">
            {todayAppts.map((a) => {
              const pt = db.patients.find((p) => p.id === a.ptId);
              if (!pt) return null;
              return (
                <button key={a.id} type="button" className="qf-pt-card today" onClick={() => onPick(pt.id, pt.name)}>
                  <Avatar name={pt.name} size="md" className="shrink-0" />
                  <div className="qf-pt-info">
                    <div className="qf-pt-name">{pt.name}</div>
                    <div className="qf-pt-meta">{a.time} · {a.purpose || a.note}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
      <div className="qf-section-title">{q ? "🔍 نتائج البحث" : "🕐 مرضى مقترحون"}</div>
      <div className="qf-pt-list">
        {suggestions.map((p) => (
          <button key={p.id} type="button" className="qf-pt-card" onClick={() => onPick(p.id, p.name)}>
            <Avatar name={p.name} size="md" className="shrink-0" />
            <div className="qf-pt-info">
              <div className="qf-pt-name">{p.name}</div>
              <div className="qf-pt-meta">{p.phone || ""}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function Step2({
  state,
  db,
  onBack,
  onContinue,
  onAction,
}: {
  state: QuickFlowState;
  db: ReturnType<typeof useDbStore.getState>["db"];
  onBack: () => void;
  onContinue: (planId: string) => void;
  onAction: (a: QfAction) => void;
}) {
  const pending = db.plans.filter((p) => p.ptId === state.ptId && p.status === "active");
  return (
    <>
      <div className="qf-step-title">الخطوة 2: ماذا تريد أن تفعل؟</div>
      <div className="qf-pt-pill">
        <Avatar name={state.ptName} size="sm" />
        <b>{state.ptName}</b>
        <button type="button" className="link-btn" style={{ marginInlineStart: "auto" }} onClick={onBack}>
          تغيير
        </button>
      </div>
      {pending.length > 0 ? (
        <>
          <div className="qf-section-title">🔄 علاجات غير مكتملة</div>
          <div className="qf-pending-list">
            {pending.map((p) => {
              const paid = db.payments.filter((pay) => pay.planId === p.id).reduce((s, x) => s + (Number(x.amount) || 0), 0);
              const debt = (Number(p.totalCost) || 0) - paid;
              const done = p.sessions.filter((s) => s.done || s.completed).length;
              return (
                <button key={p.id} type="button" className="qf-pending-card" onClick={() => onContinue(p.id)}>
                  <div className="qf-pending-top">
                    <span className="qf-pending-type">{p.type}</span>
                    {(p.teeth || []).length > 0 && <span className="qf-pending-teeth">🦷 {(p.teeth || []).join(", ")}</span>}
                  </div>
                  <div className="qf-pending-mid">
                    <span>{done}/{p.sessions.length} جلسة</span>
                    <span className={debt > 0 ? "debt" : "paid"}>{debt > 0 ? `متبقي: ${fmtMoney(debt)}` : "✓ مسدد"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="qf-empty">لا توجد علاجات جارية</div>
      )}
      <div className="qf-section-title">⚡ ابدأ جديداً</div>
      <div className="qf-action-grid">
        <button type="button" className="qf-action-card" onClick={() => onAction("new")}>
          <div className="qf-action-icon">✨</div>
          <div className="qf-action-title">علاج جديد</div>
        </button>
        <button type="button" className="qf-action-card complex" onClick={() => onAction("complex")}>
          <div className="qf-action-icon">🦷</div>
          <div className="qf-action-title">حالة معقدة</div>
        </button>
        <button type="button" className="qf-action-card mini" onClick={() => onAction("rxOnly")}>
          <div className="qf-action-icon">💊</div>
          <div className="qf-action-title">وصفة فقط</div>
        </button>
        <button type="button" className="qf-action-card mini" onClick={() => onAction("apptOnly")}>
          <div className="qf-action-icon">📅</div>
          <div className="qf-action-title">موعد فقط</div>
        </button>
      </div>
    </>
  );
}

function Step3({
  state,
  db,
  onPatch,
  onToggleTooth,
  onUpdateTooth,
  onRemoveTooth,
}: {
  state: QuickFlowState;
  db: ReturnType<typeof useDbStore.getState>["db"];
  onPatch: (p: Partial<QuickFlowState>) => void;
  onToggleTooth: (n: number) => void;
  onUpdateTooth: (idx: number, p: Partial<QfSelectedTooth>) => void;
  onRemoveTooth: (tooth: string) => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const patient = db.patients.find((p) => p.id === state.ptId);
  const patientChart = patient?.chart || {};

  const noteBlock = (
    <>
      <div className="qf-note-card">
        <div className="qf-note-head">
          <span className="qf-note-label">{L("ملاحظة", "Note", lang)}</span>
          <QfVoiceNote
            noteText={state.noteText}
            onNoteChange={(v) => onPatch({ noteText: v })}
            dictating={state.dictating}
            onDictatingChange={(v) => onPatch({ dictating: v })}
          />
        </div>
        <textarea
          className="qf-note-input"
          rows={2}
          placeholder={L("أي ملاحظة…", "Any note…", lang)}
          value={state.noteText}
          onChange={(e) => onPatch({ noteText: e.target.value })}
        />
      </div>
      <QfReminderSection reminder={state.reminder} onChange={(r) => onPatch({ reminder: r })} />
    </>
  );

  if (state.action === "continue" && state.planId) {
    const plan = db.plans.find((p) => p.id === state.planId);
    if (!plan) return null;
    const total = Number(plan.totalCost) || 0;
    const paid = db.payments.filter((p) => p.planId === plan.id).reduce((s, x) => s + (Number(x.amount) || 0), 0);
    const debt = total - paid;
    return (
      <>
        <div className="qf-step-title">
          {state.paymentOnlyMode
            ? `💰 ${L("تسديد دين فقط", "Pay debt only", lang)} · ${state.ptName}`
            : `${L("إكمال علاج", "Continue", lang)} · ${L("جلسة", "Session", lang)} ${state.sessionIdx + 1}`}
        </div>
        {state.paymentOnlyMode && (
          <div className="qf-notice">
            ⚠️ {L(`كل الجلسات منجزة — متبقي ${fmtMoney(debt)}`, `All sessions done — ${fmtMoney(debt)} debt`, lang)}
          </div>
        )}
        <div className="qf-plan-summary">
          <div><b>{state.ptName}</b> · {plan.type}</div>
          {(plan.teeth || []).length > 0 && (
            <div className="muted">{(plan.teeth || []).map((t) => `🦷 ${t}`).join(" ")}</div>
          )}
          <div className="qf-plan-financials">
            <span>{L("الكلي", "Total", lang)}: <b>{fmtMoney(total)}</b></span>
            <span>{L("المسدد", "Paid", lang)}: <b>{fmtMoney(paid)}</b></span>
            <span className={debt > 0 ? "debt" : "paid"}>{L("المتبقي", "Due", lang)}: <b>{fmtMoney(debt)}</b></span>
          </div>
        </div>
        <div className="qf-section-title">💰 {L("المبلغ المسدد الآن", "Paid now", lang)}</div>
        <QfAmountStepper value={state.amountPaid} onChange={(n) => onPatch({ amountPaid: n })} />
        {!state.paymentOnlyMode && (
          <>
            <div className="qf-section-title">➕ {L("مبلغ إضافي على الكلفة (اختياري)", "Add to total cost", lang)}</div>
            <QfAmountStepper value={state.sessionExtraAmount} onChange={(n) => onPatch({ sessionExtraAmount: n })} />
            <label className="qf-checkbox-row">
              <input type="checkbox" checked={state.sessionDone} onChange={(e) => onPatch({ sessionDone: e.target.checked })} />
              <span><b>✓ {L("تم إنجاز هذه الجلسة", "Mark session done", lang)}</b></span>
            </label>
          </>
        )}
        {noteBlock}
      </>
    );
  }

  if (state.action === "new") {
    return (
      <>
        <div className="qf-step-title">{L("علاج جديد لـ", "New treatment for", lang)} {state.ptName}</div>
        <div className="qf-section-title">🦷 {L("انقر على السن", "Tap the tooth", lang)}</div>
        <QfDentalChart
          selected={state.selectedTeeth.map((t) => t.tooth)}
          onToggle={onToggleTooth}
          chart={patientChart}
          lang={lang}
        />
        <QfSelectedTeethPanel
          db={db}
          teeth={state.selectedTeeth}
          amountPaid={state.amountPaid}
          onAmountPaidChange={(n) => onPatch({ amountPaid: n })}
          onUpdateTooth={onUpdateTooth}
          onRemoveTooth={onRemoveTooth}
        />
        <div className="qf-section-title">{L("حالة العمل اليوم", "Today's status", lang)}</div>
        <div className="qf-status-row">
          <button type="button" className={`qf-status-btn${state.firstSessionDone ? " active done" : ""}`} onClick={() => onPatch({ firstSessionDone: true })}>
            ✅ {L("نفّذت الجلسة اليوم", "Executed today", lang)}
          </button>
          <button type="button" className={`qf-status-btn${!state.firstSessionDone ? " active planned" : ""}`} onClick={() => onPatch({ firstSessionDone: false })}>
            📋 {L("تخطيط فقط (لم أبدأ)", "Plan only", lang)}
          </button>
        </div>
        {noteBlock}
      </>
    );
  }

  if (state.action === "complex") {
    return (
      <>
        <div className="qf-step-title">🦷 {L("حالة معقدة", "Complex case", lang)} — {state.ptName}</div>
        <div className="qf-section-title">{L("التصنيف", "Category", lang)}</div>
        <div className="qf-cat-row">
          {(["implant", "ortho", "smile"] as const).map((c) => (
            <button key={c} type="button" className={`qf-cat-btn${state.complexCategory === c ? " active" : ""}`} onClick={() => onPatch({ complexCategory: c })}>
              {c === "implant" ? "🦷 زراعة" : c === "ortho" ? "🪥 تقويم" : "😁 ابتسامة"}
            </button>
          ))}
        </div>
        <div className="field">
          <label>{L("تصنيف الحالة", "Classification", lang)}</label>
          <input value={state.complexClass} onChange={(e) => onPatch({ complexClass: e.target.value })} placeholder={state.complexCategory === "ortho" ? "Class II Div 1" : ""} />
        </div>
        <div className="qf-section-title">🦷 {L("الأسنان المتعلقة", "Involved teeth", lang)}</div>
        <QfDentalChart
          selected={state.selectedTeeth.map((t) => t.tooth)}
          onToggle={onToggleTooth}
          chart={patientChart}
          lang={lang}
        />
        <QfSelectedTeethPanel
          db={db}
          teeth={state.selectedTeeth}
          onUpdateTooth={onUpdateTooth}
          onRemoveTooth={onRemoveTooth}
          showTotalPaid={false}
          isComplex
        />
        <div className="qf-section-title">💰 {L("الكلفة والأقساط", "Cost & payments", lang)}</div>
        <div className="qf-financials-grid">
          <div className="field">
            <label>{L("الكلفة الإجمالية", "Total cost", lang)}</label>
            <QfAmountStepper value={state.totalCost} onChange={(n) => onPatch({ totalCost: n })} />
          </div>
          <div className="field">
            <label>{L("قسط اليوم", "Today's payment", lang)}</label>
            <QfAmountStepper value={state.amountPaid} onChange={(n) => onPatch({ amountPaid: n })} />
          </div>
          <div className="field">
            <label>{L("عدد الجلسات المتوقعة", "Expected sessions", lang)}</label>
            <div className="qf-num-step">
              <button type="button" onClick={() => onPatch({ sessionsExpected: Math.max(1, state.sessionsExpected - 1) })}>−</button>
              <span><b>{state.sessionsExpected}</b></span>
              <button type="button" onClick={() => onPatch({ sessionsExpected: state.sessionsExpected + 1 })}>+</button>
            </div>
          </div>
          <div className="field">
            <label>{L("عدد الأقساط", "Installments", lang)}</label>
            <input type="number" min={0} value={state.installments} onChange={(e) => onPatch({ installments: Number(e.target.value) || 0 })} />
          </div>
          <div className="field span-2">
            <label>{L("أجور المراجعات", "Follow-up fees", lang)}</label>
            <QfAmountStepper value={state.followupFees} onChange={(n) => onPatch({ followupFees: n })} />
          </div>
          <div className="field span-2">
            <label>{L("مسدد سابقاً (توثيق)", "Previously paid", lang)}</label>
            <QfAmountStepper value={state.paidPrev} onChange={(n) => onPatch({ paidPrev: n })} />
          </div>
        </div>
        {state.complexCategory !== "ortho" && (
          <>
            <div className="qf-section-title">{L("حالة الجلسة الأولى", "First session today", lang)}</div>
            <div className="qf-status-row">
              <button type="button" className={`qf-status-btn${state.firstSessionDone ? " active done" : ""}`} onClick={() => onPatch({ firstSessionDone: true })}>
                ✅ {L("بدأت اليوم", "Started today", lang)}
              </button>
              <button type="button" className={`qf-status-btn${!state.firstSessionDone ? " active planned" : ""}`} onClick={() => onPatch({ firstSessionDone: false })}>
                📋 {L("تخطيط فقط", "Plan only", lang)}
              </button>
            </div>
          </>
        )}
        {noteBlock}
      </>
    );
  }

  if (state.action === "rxOnly") {
    return (
      <>
        <div className="qf-step-title">💊 وصفة لـ {state.ptName}</div>
        <div className="form-grid">
          <div className="field"><label>الدواء</label><input value={state.rxMedName} onChange={(e) => onPatch({ rxMedName: e.target.value })} /></div>
          <div className="field"><label>الجرعة</label><input value={state.rxDose} onChange={(e) => onPatch({ rxDose: e.target.value })} /></div>
          <div className="field"><label>المدة</label><input value={state.rxDuration} onChange={(e) => onPatch({ rxDuration: e.target.value })} /></div>
        </div>
      </>
    );
  }

  if (state.action === "apptOnly") {
    return (
      <>
        <div className="qf-step-title">📅 موعد لـ {state.ptName}</div>
        <div className="form-grid">
          <div className="field"><label>التاريخ</label><input type="date" value={state.apptDate} onChange={(e) => onPatch({ apptDate: e.target.value })} /></div>
          <div className="field"><label>الوقت</label><input type="time" value={state.apptTime} onChange={(e) => onPatch({ apptTime: e.target.value })} /></div>
          <div className="field full"><label>الغرض</label><input value={state.apptPurpose} onChange={(e) => onPatch({ apptPurpose: e.target.value })} /></div>
        </div>
      </>
    );
  }

  return null;
}

function NewPtPanel({
  draft,
  onChange,
}: {
  draft: NonNullable<QuickFlowState["newPtDraft"]>;
  onChange: (d: NonNullable<QuickFlowState["newPtDraft"]>) => void;
}) {
  return (
    <>
      <div className="qf-step-title">➕ مريض جديد</div>
      <div className="form-grid">
        <div className="field span-2">
          <Input label="الاسم *" value={draft.name} onChange={(e) => onChange({ ...draft, name: e.target.value })} />
        </div>
        <div className="field">
          <Input label="الهاتف *" value={draft.phone} onChange={(e) => onChange({ ...draft, phone: e.target.value })} />
        </div>
        <div className="field">
          <Input label="العمر" type="number" value={draft.age} onChange={(e) => onChange({ ...draft, age: e.target.value })} />
        </div>
        <div className="field">
          <label>الجنس</label>
          <Select value={draft.gender} onChange={(e) => onChange({ ...draft, gender: e.target.value as "male" | "female" })}>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </Select>
        </div>
      </div>
    </>
  );
}
