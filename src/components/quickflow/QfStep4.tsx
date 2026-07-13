"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useDbStore } from "@/stores/useDbStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { printRx } from "@/lib/print";
import { rxTemplateFor, SEED_MEDS } from "@/lib/rx-templates";
import { treatmentLabel } from "@/lib/treatment-types";
import { waLink } from "@/lib/wa";
import { todayStr } from "@/lib/format";
import type { QuickFlowState } from "@/types/quickflow";
import type { RxMed } from "@/types/db";
import { Button, IconButton, Input } from "@/components/ds";

interface PendingActions {
  rxDone: boolean;
  printDone: boolean;
  apptDone: boolean;
  waDone: boolean;
}

function suggestedType(state: QuickFlowState): string {
  if (state.action === "new" && state.selectedTeeth[0]) return state.selectedTeeth[0].treatmentId || "other";
  if (state.action === "complex") {
    return state.complexCategory === "implant" ? "implant" : state.complexCategory === "ortho" ? "ortho" : "veneer";
  }
  if (state.action === "continue" && state.planId) return state.planId;
  return "other";
}

export function QfStep4({
  state,
  onPatch,
  onClose,
  onProfile,
  onBackToStep3,
  onPark,
}: {
  state: QuickFlowState;
  onPatch: (p: Partial<QuickFlowState>) => void;
  onClose: () => void;
  onProfile: () => void;
  onBackToStep3: () => void;
  onPark: () => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const db = useDbStore((s) => s.db);
  const addPrescription = useDbStore((s) => s.addPrescription);
  const addAppointment = useDbStore((s) => s.addAppointment);
  const addReminder = useDbStore((s) => s.addReminder);
  const updatePatient = useDbStore((s) => s.updatePatient);

  const pending: PendingActions = state.pendingActions || { rxDone: false, printDone: false, apptDone: false, waDone: false };
  const typeId = state.rxSuggestedType || suggestedType(state);

  const [subView, setSubView] = useState<"main" | "rx" | "appt" | "wa" | "note">("main");
  const [rxMeds, setRxMeds] = useState<RxMed[]>([]);
  const [rxTips, setRxTips] = useState("");
  const [savedRxId, setSavedRxId] = useState(state.savedRxId || "");
  const [apptDate, setApptDate] = useState(todayStr());
  const [apptTime, setApptTime] = useState("10:00");
  const [apptPurpose, setApptPurpose] = useState("متابعة");
  const [waDate, setWaDate] = useState(todayStr());
  const [waText, setWaText] = useState("");
  const [extraNote, setExtraNote] = useState("");

  const pt = db.patients.find((p) => p.id === state.ptId);

  function setPending(p: Partial<PendingActions>) {
    onPatch({ pendingActions: { ...pending, ...p } });
  }

  function openRx() {
    const tpl = rxTemplateFor(typeId, lang);
    setRxMeds(tpl.meds);
    setRxTips(tpl.tips);
    setSubView("rx");
  }

  function commitRx() {
    if (!rxMeds.some((m) => m.name.trim())) return;
    const rx = addPrescription({
      ptId: state.ptId,
      date: todayStr(),
      meds: rxMeds.filter((m) => m.name.trim()),
      notes: rxTips,
      tips: { ar: rxTips, en: rxTips },
    });
    setSavedRxId(rx.id);
    onPatch({ savedRxId: rx.id });
    setPending({ rxDone: true });
    setSubView("main");
  }

  function doPrint() {
    const id = savedRxId || state.savedRxId;
    if (!id) return;
    printRx(db, id, lang);
    setPending({ printDone: true });
  }

  function commitAppt() {
    addAppointment({
      ptId: state.ptId,
      date: apptDate,
      time: apptTime,
      purpose: apptPurpose,
      status: "scheduled",
    });
    setPending({ apptDone: true });
    setSubView("main");
  }

  function commitWa() {
    if (!pt?.phone) {
      alert(L("لا يوجد رقم هاتف", "No phone number", lang));
      return;
    }
    const dueAt = new Date(waDate + "T09:00:00").getTime();
    addReminder({
      ptId: state.ptId,
      ptName: state.ptName,
      content: waText || L("تذكير بموعد المتابعة", "Follow-up reminder", lang),
      dueAt,
      recipients: ["wa"],
      done: false,
    });
    window.open(waLink(pt.phone, waText || L("تذكير بموعدك", "Appointment reminder", lang)), "_blank");
    setPending({ waDone: true });
    setSubView("main");
  }

  function commitNote() {
    if (!extraNote.trim() || !pt) return;
    updatePatient(pt.id, { notes: ((pt.notes || "") + "\n" + extraNote.trim()).trim() });
    setSubView("main");
  }

  if (subView === "rx") {
    return (
      <>
        <div className="qf-rx-banner">
          💊 {L("وصفة مقترحة لـ", "Suggested Rx for", lang)}: <b>{treatmentLabel(typeId)}</b>
        </div>
        {rxMeds.map((m, i) => (
          <div className="qf-rx-med-row" key={i}>
            <input value={m.name} onChange={(e) => setRxMeds(rxMeds.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder={L("الدواء", "Med", lang)} style={{ flex: 2 }} />
            <input value={m.dose || ""} onChange={(e) => setRxMeds(rxMeds.map((x, j) => (j === i ? { ...x, dose: e.target.value } : x)))} placeholder={L("الجرعة", "Dose", lang)} />
            <input value={m.duration || ""} onChange={(e) => setRxMeds(rxMeds.map((x, j) => (j === i ? { ...x, duration: e.target.value } : x)))} placeholder={L("المدة", "Duration", lang)} />
            <IconButton label={L("حذف", "Remove", lang)} variant="danger" onClick={() => setRxMeds(rxMeds.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setRxMeds([...rxMeds, { name: "", dose: "", duration: "" }])}>
          <Plus className="h-4 w-4" />
          {L("إضافة دواء", "Add med", lang)}
        </Button>
        <details className="qf-seed-meds-details mt-2">
          <summary className="cursor-pointer text-sm font-medium text-foreground-secondary">
            📋 {L("أدوية شائعة", "Common meds", lang)}
          </summary>
          <div className="qf-seed-meds-grid">
            {SEED_MEDS.map((m, i) => (
              <button key={i} type="button" className="qf-seed-med-chip" onClick={() => setRxMeds([...rxMeds, { name: lang === "en" ? m.en : m.ar, dose: m.dose, duration: m.duration }])}>
                {lang === "en" ? m.en : m.ar}
              </button>
            ))}
          </div>
        </details>
        <textarea className="qf-note-input mt-2" rows={4} value={rxTips} onChange={(e) => setRxTips(e.target.value)} placeholder={L("نصائح للمريض", "Patient tips", lang)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => setSubView("main")}>
            {L("← رجوع", "← Back", lang)}
          </Button>
          <Button type="button" onClick={commitRx}>
            💾 {L("حفظ الوصفة", "Save Rx", lang)}
          </Button>
        </div>
      </>
    );
  }

  if (subView === "appt") {
    return (
      <>
        <div className="form-grid">
          <div className="field">
            <Input label={L("التاريخ", "Date", lang)} type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
          </div>
          <div className="field">
            <Input label={L("الوقت", "Time", lang)} type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />
          </div>
          <div className="field span-2">
            <Input label={L("الغرض", "Purpose", lang)} value={apptPurpose} onChange={(e) => setApptPurpose(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => setSubView("main")}>
            {L("← رجوع", "← Back", lang)}
          </Button>
          <Button type="button" onClick={commitAppt}>
            📅 {L("تثبيت الموعد", "Book", lang)}
          </Button>
        </div>
      </>
    );
  }

  if (subView === "wa") {
    return (
      <>
        <Input label={L("تاريخ الإرسال", "Send date", lang)} type="date" value={waDate} onChange={(e) => setWaDate(e.target.value)} />
        <textarea className="qf-note-input mt-2" rows={3} value={waText} onChange={(e) => setWaText(e.target.value)} placeholder={L("نص الرسالة", "Message", lang)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => setSubView("main")}>
            {L("← رجوع", "← Back", lang)}
          </Button>
          <Button type="button" onClick={commitWa}>
            📱 {L("جدولة واتساب", "Schedule WA", lang)}
          </Button>
        </div>
      </>
    );
  }

  if (subView === "note") {
    return (
      <>
        <textarea className="qf-note-input" rows={4} value={extraNote} onChange={(e) => setExtraNote(e.target.value)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" onClick={() => setSubView("main")}>
            {L("← رجوع", "← Back", lang)}
          </Button>
          <Button type="button" onClick={commitNote}>
            📝 {L("حفظ", "Save", lang)}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="qf-saved-banner">
        <div className="qf-saved-icon">✅</div>
        <div>
          <div className="qf-saved-title">{L("تم الحفظ بنجاح", "Saved successfully", lang)}</div>
          <div className="qf-saved-sub">
            {state.ptName} · {L("يمكنك التعديل من ملف المريض", "Edit later from patient file", lang)}
          </div>
        </div>
      </div>
      <div className="qf-step-title">{L("ماذا بعد؟", "What's next?", lang)}</div>
      <div className="qf-postsave-grid">
        <button type="button" className={`qf-postsave-btn${pending.rxDone ? " done" : ""}`} onClick={openRx}>
          <div className="qf-ps-icon">💊</div>
          <div className="qf-ps-label">{L("وصفة طبية", "Prescription", lang)}</div>
          <div className="qf-ps-sub">{pending.rxDone ? "✓" : L("مع نصائح حسب العلاج", "Treatment tips", lang)}</div>
        </button>
        <button type="button" className={`qf-postsave-btn${pending.printDone ? " done" : ""}`} disabled={!pending.rxDone && !savedRxId} onClick={doPrint}>
          <div className="qf-ps-icon">🖨️</div>
          <div className="qf-ps-label">{L("طباعة الوصفة", "Print Rx", lang)}</div>
        </button>
        <button type="button" className={`qf-postsave-btn${pending.apptDone ? " done" : ""}`} onClick={() => setSubView("appt")}>
          <div className="qf-ps-icon">📅</div>
          <div className="qf-ps-label">{L("موعد متابعة", "Follow-up", lang)}</div>
        </button>
        <button type="button" className={`qf-postsave-btn${pending.waDone ? " done" : ""}`} onClick={() => setSubView("wa")}>
          <div className="qf-ps-icon">📱</div>
          <div className="qf-ps-label">{L("تذكير واتساب", "WhatsApp", lang)}</div>
        </button>
        <button type="button" className="qf-postsave-btn" onClick={() => setSubView("note")}>
          <div className="qf-ps-icon">📝</div>
          <div className="qf-ps-label">{L("إضافة ملاحظة", "Add note", lang)}</div>
        </button>
        <button type="button" className="qf-postsave-btn" onClick={onProfile}>
          <div className="qf-ps-icon">👤</div>
          <div className="qf-ps-label">{L("ملف المريض", "Patient file", lang)}</div>
        </button>
      </div>
      <div className="qf-park-row">
        <div className="qf-park-info">
          <b>⏸ {L("إيقاف مؤقت", "Park session", lang)}</b>
          <div className="text-muted" style={{ fontSize: 11 }}>
            {L("مريض ينتظر — استئنف لاحقاً", "Patient waiting — resume later", lang)}
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onPark}>
          ⏸ {L("مريض جديد", "New patient", lang)}
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={onBackToStep3}>
          ✏️ {L("تعديل", "Edit", lang)}
        </Button>
        <Button type="button" onClick={onClose}>
          ✓ {L("إنهاء كامل", "Finish", lang)}
        </Button>
      </div>
    </>
  );
}
