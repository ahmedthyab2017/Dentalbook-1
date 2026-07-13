"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDbStore } from "@/stores/useDbStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import { consentTemplates, type ConsentType } from "@/lib/consent-templates";
import { buildConsentPrintHtml, printHtml } from "@/lib/print";
import type { Patient, ConsentRecord } from "@/types/db";

export function ConsentModal({
  patient,
  open,
  onClose,
}: {
  patient: Patient;
  open: boolean;
  onClose: () => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);
  const updatePatient = useDbStore((s) => s.updatePatient);
  const db = useDbStore((s) => s.db);

  const tpls = consentTemplates(lang);
  const [type, setType] = useState<ConsentType>("general");
  const [agreed, setAgreed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const tpl = tpls[type];

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(pt.clientX - rect.left, pt.clientY - rect.top);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pt = "touches" in e ? e.touches[0] : e;
    ctx.lineTo(pt.clientX - rect.left, pt.clientY - rect.top);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function endDraw() {
    drawing.current = false;
  }

  function clearSig() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  function saveAndPrint() {
    if (!agreed) {
      alert(L("يجب الموافقة أولاً", "You must agree first", lang));
      return;
    }
    const signature = canvasRef.current?.toDataURL("image/png") || "";
    const rec: ConsentRecord = {
      type,
      title: tpl.title,
      text: tpl.text,
      agreedAt: Date.now(),
      signature: signature || undefined,
    };
    updatePatient(patient.id, { consents: [...(patient.consents || []), rec] });
    printHtml(buildConsentPrintHtml(db, { ...patient, consents: [...(patient.consents || []), rec] }, rec, lang));
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={L("نموذج موافقة", "Consent Form", lang)}>
      <div className="modal-body">
        <div className="field">
          <label>{L("نوع التعهّد", "Consent type", lang)}</label>
          <select value={type} onChange={(e) => setType(e.target.value as ConsentType)}>
            {(Object.keys(tpls) as ConsentType[]).map((k) => (
              <option key={k} value={k}>{tpls[k].title}</option>
            ))}
          </select>
        </div>
        <div className="consent-print-text muted" style={{ whiteSpace: "pre-wrap", margin: "12px 0" }}>
          {tpl.text}
        </div>
        <label className="row gap" style={{ alignItems: "center" }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          {L("أوافق على ما ورد أعلاه", "I agree to the above", lang)}
        </label>
        <div className="qf-section-title">{L("التوقيع", "Signature", lang)}</div>
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          style={{ border: "1px solid var(--border)", borderRadius: 8, width: "100%", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <button type="button" className="btn btn-sm btn-ghost mt-2" onClick={clearSig}>
          {L("مسح التوقيع", "Clear signature", lang)}
        </button>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>{L("إلغاء", "Cancel", lang)}</button>
        <button className="btn btn-primary" onClick={saveAndPrint}>
          ✍️ {L("حفظ وطباعة", "Save & Print", lang)}
        </button>
      </div>
    </Modal>
  );
}
