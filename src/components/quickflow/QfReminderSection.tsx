"use client";

import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { L } from "@/lib/i18n";
import type { QfReminderDraft } from "@/types/quickflow";

export function QfReminderSection({
  reminder,
  onChange,
}: {
  reminder: QfReminderDraft | null;
  onChange: (r: QfReminderDraft | null) => void;
}) {
  const lang = useUiPrefsStore((s) => s.lang);

  function setHours(h: number) {
    onChange({
      dueAt: Date.now() + h * 3600000,
      content: "",
      recipients: ["inApp"],
    });
  }

  if (!reminder) {
    return (
      <>
        <div className="qf-section-title">
          🔔 {L("تذكير متابعة (اختياري)", "Follow-up reminder (optional)", lang)}
        </div>
        <div className="qf-reminder-quick">
          <button type="button" className="qf-rem-chip" onClick={() => setHours(24)}>
            24 {L("س", "h", lang)}
          </button>
          <button type="button" className="qf-rem-chip" onClick={() => setHours(48)}>
            48 {L("س", "h", lang)}
          </button>
          <button type="button" className="qf-rem-chip" onClick={() => setHours(72)}>
            72 {L("س", "h", lang)}
          </button>
          <button type="button" className="qf-rem-chip" onClick={() => setHours(168)}>
            {L("أسبوع", "1 week", lang)}
          </button>
        </div>
      </>
    );
  }

  const dueStr = new Date(reminder.dueAt).toLocaleString(lang === "ar" ? "ar-IQ" : "en", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <>
      <div className="qf-section-title">
        🔔 {L("التذكير", "Reminder", lang)}
        <button type="button" className="link-btn" onClick={() => onChange(null)}>
          ✕
        </button>
      </div>
      <div className="qf-reminder-config">
        <div className="muted">{dueStr}</div>
        <textarea
          className="qf-note-input"
          rows={2}
          placeholder={L("محتوى التذكير…", "Reminder content…", lang)}
          value={reminder.content}
          onChange={(e) => onChange({ ...reminder, content: e.target.value })}
        />
        <div className="qf-rem-recipients">
          <label>
            <input
              type="checkbox"
              checked={reminder.recipients.includes("inApp")}
              onChange={(e) => {
                const rec = new Set(reminder.recipients);
                if (e.target.checked) rec.add("inApp");
                else rec.delete("inApp");
                onChange({ ...reminder, recipients: [...rec] as QfReminderDraft["recipients"] });
              }}
            />
            {L("في التطبيق", "In app", lang)}
          </label>
          <label>
            <input
              type="checkbox"
              checked={reminder.recipients.includes("wa")}
              onChange={(e) => {
                const rec = new Set(reminder.recipients);
                if (e.target.checked) rec.add("wa");
                else rec.delete("wa");
                onChange({ ...reminder, recipients: [...rec] as QfReminderDraft["recipients"] });
              }}
            />
            {L("واتساب", "WhatsApp", lang)}
          </label>
        </div>
      </div>
    </>
  );
}
