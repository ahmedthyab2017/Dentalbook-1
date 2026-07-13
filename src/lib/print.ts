import type { DentistDb, Prescription, Patient } from "@/types/db";
import { fmtDateShort } from "@/lib/format";
import { T, L } from "@/lib/i18n";
import type { Lang } from "@/types/session";

function esc(s: string | undefined | null): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printHtml(html: string) {
  const area = document.getElementById("print-area");
  if (!area) return;
  area.innerHTML = html;
  document.body.classList.add("printing");
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove("printing"), 500);
  }, 120);
}

export function buildRxPrintHtml(db: DentistDb, rx: Prescription, pt: Patient, lang: Lang): string {
  const m = db.meta;
  return `
    <div class="rx-print">
      <div class="rx-print-head">
        <div class="rx-print-clinic">
          <h1>${esc(m.clinicName)}</h1>
          <div>${esc(m.doctorName || "")}</div>
          <div class="muted">${esc(m.clinicAddress)} • ${esc(m.clinicPhone)}</div>
        </div>
        <div class="rx-print-logo">℞</div>
      </div>
      <hr>
      <div class="rx-print-pt">
        <div><b>${T("patient", lang)}:</b> ${esc(pt.name)}</div>
        <div><b>${T("age", lang)}:</b> ${pt.age || "—"} &nbsp; <b>${T("date", lang)}:</b> ${esc(fmtDateShort(rx.date))}</div>
      </div>
      <div class="rx-print-meds">
        ${rx.meds.map((med, i) => `
          <div class="rx-print-med">
            <b>${i + 1}.</b> ${esc(med.name)}
            <div class="muted">${esc(med.dose || "")} — ${esc(med.duration || "")}</div>
          </div>
        `).join("")}
      </div>
      ${rx.notes ? `<div class="rx-print-notes"><b>${T("notes", lang)}:</b> ${esc(rx.notes)}</div>` : ""}
      <div class="rx-print-sign">
        <div>${T("signature", lang)}: ____________________</div>
        <div>${esc(m.doctorName || "")}</div>
      </div>
    </div>`;
}

export function printRx(db: DentistDb, rxId: string, lang: Lang) {
  const rx = db.prescriptions.find((x) => x.id === rxId);
  const pt = rx && db.patients.find((p) => p.id === rx.ptId);
  if (!rx || !pt) return;
  printHtml(buildRxPrintHtml(db, rx, pt, lang));
}

export interface ReferralDraft {
  ptId: string;
  specialty: string;
  toDoctor: string;
  reason: string;
  findings: string;
  urgency: "routine" | "soon" | "urgent";
}

export function buildReferralPrintHtml(db: DentistDb, pt: Patient, d: ReferralDraft, lang: Lang): string {
  const m = db.meta;
  const urg = { routine: L("روتيني", "Routine", lang), soon: L("قريب", "Soon", lang), urgent: L("عاجل ⚠️", "Urgent ⚠️", lang) }[d.urgency];
  return `
    <div class="doc-print">
      <div class="doc-print-head">
        <div><h1>${esc(m.clinicName)}</h1><div>${esc(m.doctorName || "")}</div>
        <div class="muted">${esc(m.clinicAddress)} • ${esc(m.clinicPhone)}</div></div>
        <div class="doc-print-badge">📄 ${L("إحالة طبية", "Medical Referral", lang)}</div>
      </div><hr>
      <div class="doc-print-row"><b>${L("التاريخ", "Date", lang)}:</b> ${fmtDateShort(new Date().toISOString().slice(0, 10))} &nbsp; <b>${L("الأولوية", "Urgency", lang)}:</b> ${urg}</div>
      <div class="doc-print-to">${L("إلى السيد الطبيب الاختصاصي في", "To the specialist in", lang)}: <b>${esc(d.specialty)}</b>${d.toDoctor ? " — " + esc(d.toDoctor) : ""}</div>
      <div class="doc-print-section"><b>${L("بيانات المريض", "Patient", lang)}:</b>
        <div>${L("الاسم", "Name", lang)}: ${esc(pt.name)} — ${L("العمر", "Age", lang)}: ${pt.age || "—"}</div>
        ${pt.allergies ? `<div>${L("الحساسية", "Allergies", lang)}: ${esc(pt.allergies)}</div>` : ""}
      </div>
      <div class="doc-print-section"><b>${L("سبب الإحالة", "Reason", lang)}:</b><div>${esc(d.reason || "—")}</div></div>
      ${d.findings ? `<div class="doc-print-section"><b>${L("ملاحظات", "Findings", lang)}:</b><div>${esc(d.findings)}</div></div>` : ""}
      <div class="doc-print-sign"><div>${L("الطبيب المُحيل", "Referring dentist", lang)}: ${esc(m.doctorName || "")}</div></div>
    </div>`;
}

export function buildConsentPrintHtml(
  db: DentistDb,
  pt: Patient,
  rec: { title: string; text: string; agreedAt: number; signature?: string },
  lang: Lang
): string {
  const m = db.meta;
  return `
    <div class="doc-print">
      <div class="doc-print-head">
        <div><h1>${esc(m.clinicName)}</h1><div>${esc(m.doctorName || "")}</div></div>
        <div class="doc-print-badge">✍️ ${esc(rec.title)}</div>
      </div><hr>
      <div class="doc-print-row"><b>${L("المريض", "Patient", lang)}:</b> ${esc(pt.name)}</div>
      <div class="doc-print-section consent-print-text">${esc(rec.text)}</div>
      <div class="doc-print-sign">
        ${rec.signature ? `<img src="${rec.signature}" style="height:70px" alt="sig"/>` : "____________________"}
      </div>
    </div>`;
}

export function buildExamPrintHtml(db: DentistDb, pt: Patient, lang: Lang): string {
  const m = db.meta;
  const chart = pt.chart || {};
  const teeth = Object.entries(chart).filter(([, v]) => v && v !== "healthy");
  return `
    <div class="doc-print">
      <div class="doc-print-head">
        <div><h1>${esc(m.clinicName)}</h1></div>
        <div class="doc-print-badge">🦷 ${L("فحص عام", "General Exam", lang)}</div>
      </div><hr>
      <div class="doc-print-section"><b>${L("المريض", "Patient", lang)}:</b> ${esc(pt.name)} — ${pt.age || "—"} ${L("سنة", "yrs", lang)}</div>
      <div class="doc-print-section"><b>${L("الحساسية", "Allergies", lang)}:</b> ${esc(pt.allergies || "—")}</div>
      <div class="doc-print-section"><b>${L("التاريخ الطبي", "Medical history", lang)}:</b> ${esc(pt.medical || "—")}</div>
      <div class="doc-print-section"><b>${L("ملاحظات المخطط", "Chart notes", lang)}:</b>
        ${teeth.length ? teeth.map(([t, s]) => `<div>🦷 ${t}: ${s}</div>`).join("") : L("لا مشاكل مسجّلة", "No issues recorded", lang)}
      </div>
      <div class="doc-print-sign">${esc(m.doctorName || "")}</div>
    </div>`;
}
