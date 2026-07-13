"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Save, X } from "lucide-react";
import { Tooth3D } from "./teeth/Tooth3D";
import { ToothDefs } from "./teeth/ToothDefs";
import {
  TOOTH_STATE_COLOR,
  TOOTH_STATE_LABEL_AR,
  TOOTH_STATE_LABEL_EN,
  TOOTH_STATES,
  getRootCount,
  getToothFullName,
} from "@/lib/tooth";
import { cn } from "@/lib/cn";
import type { ToothNote, ToothState } from "@/types/db";

export type ToothSavePayload = {
  state: ToothState;
  note: ToothNote;
};

export function ToothDetailPanel({
  open,
  num,
  state,
  note,
  lang = "ar",
  onClose,
  onSave,
}: {
  open: boolean;
  num: number | null;
  state: ToothState;
  note?: ToothNote;
  lang?: "ar" | "en";
  onClose: () => void;
  onSave: (payload: ToothSavePayload) => void;
}) {
  const [draftState, setDraftState] = useState<ToothState>(state);
  const [diagnosis, setDiagnosis] = useState(note?.diagnosis || "");
  const [treatments, setTreatments] = useState(note?.treatments || "");
  const [notes, setNotes] = useState(note?.notes || "");
  const [images, setImages] = useState<string[]>(note?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-seed the draft fields whenever a different tooth is opened. Adjusting
  // state during render (rather than in an effect) avoids an extra render
  // pass — see https://react.dev/learn/you-might-not-need-an-effect.
  const [syncedKey, setSyncedKey] = useState<string | null>(null);
  const openKey = open ? `${num}` : null;
  if (open && openKey !== syncedKey) {
    setSyncedKey(openKey);
    setDraftState(state);
    setDiagnosis(note?.diagnosis || "");
    setTreatments(note?.treatments || "");
    setNotes(note?.notes || "");
    setImages(note?.images || []);
  }

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImages((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSave() {
    if (num == null) return;
    const history = [...(note?.history || [])];
    if (draftState !== state) {
      history.push({
        at: Date.now(),
        text: t(
          `تغيير الحالة إلى ${isAr ? TOOTH_STATE_LABEL_AR[draftState] : TOOTH_STATE_LABEL_EN[draftState]}`,
          `Status changed to ${TOOTH_STATE_LABEL_EN[draftState]}`,
        ),
      });
    }
    onSave({
      state: draftState,
      note: { diagnosis, treatments, notes, images, history },
    });
  }

  const history = note?.history || [];

  return (
    <AnimatePresence>
      {open && num != null && (
        <div className="fixed inset-0 z-[210]" role="dialog" aria-modal aria-label={t("تفاصيل السن", "Tooth details")}>
          <ToothDefs />
          <motion.div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-[var(--shadow-soft-lg)] sm:max-w-lg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header with large 3D tooth preview */}
            <div className="relative shrink-0 overflow-hidden bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,#16233d_0%,#0a1220_60%,#060d18_100%)] px-5 pb-5 pt-4 text-white">
              <button
                type="button"
                onClick={onClose}
                aria-label={t("إغلاق", "Close")}
                className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-col items-center gap-3 pt-2">
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="drop-shadow-[0_18px_30px_rgba(59,130,246,0.35)]"
                >
                  <Tooth3D num={num} state={draftState} className="h-36 w-auto sm:h-44" />
                </motion.div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold tracking-tight">{num}</div>
                  <div className="mt-0.5 text-sm font-medium text-blue-200/80">{getToothFullName(num, lang)}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-100/90">
                    {t(`${getRootCount(num)} جذر`, `${getRootCount(num)} root${getRootCount(num) > 1 ? "s" : ""}`)}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Diagnosis / status */}
              <section className="mb-6">
                <h3 className="mb-2.5 text-sm font-bold text-foreground">{t("التشخيص والحالة", "Diagnosis & Status")}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TOOTH_STATES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraftState(s)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-semibold transition",
                        draftState === s
                          ? "border-primary bg-primary-muted text-primary-hover shadow-[0_0_0_2px_rgba(37,99,235,0.25)]"
                          : "border-border text-foreground-secondary hover:border-primary/40 hover:bg-primary-muted/40",
                      )}
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                        style={{ background: TOOTH_STATE_COLOR[s] }}
                      />
                      <span className="truncate">{isAr ? TOOTH_STATE_LABEL_AR[s] : TOOTH_STATE_LABEL_EN[s]}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder={t("تفاصيل التشخيص...", "Diagnosis details...")}
                  rows={2}
                  className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </section>

              {/* Existing treatments */}
              <section className="mb-6">
                <h3 className="mb-2.5 text-sm font-bold text-foreground">{t("العلاجات الحالية", "Existing Treatments")}</h3>
                <textarea
                  value={treatments}
                  onChange={(e) => setTreatments(e.target.value)}
                  placeholder={t("مثال: حشوة كومبوزيت 2023، تلبيسة زركون...", "e.g. Composite filling 2023, zirconia crown...")}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </section>

              {/* Images */}
              <section className="mb-6">
                <h3 className="mb-2.5 text-sm font-bold text-foreground">{t("الصور", "Images")}</h3>
                <div className="flex flex-wrap gap-2">
                  {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted transition hover:border-primary hover:text-primary"
                  >
                    <ImagePlus className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">{t("إضافة", "Add")}</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </div>
              </section>

              {/* Notes */}
              <section className="mb-6">
                <h3 className="mb-2.5 text-sm font-bold text-foreground">{t("ملاحظات", "Notes")}</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("أضف ملاحظاتك هنا...", "Add your notes here...")}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </section>

              {/* History */}
              <section>
                <h3 className="mb-2.5 text-sm font-bold text-foreground">{t("السجل", "History")}</h3>
                {history.length === 0 ? (
                  <p className="text-xs text-muted">{t("لا يوجد سجل بعد", "No history yet")}</p>
                ) : (
                  <ul className="space-y-2">
                    {[...history].reverse().map((h, i) => (
                      <li key={i} className="rounded-lg border border-border-subtle bg-background px-3 py-2 text-xs">
                        <div className="font-medium text-foreground">{h.text}</div>
                        <div className="mt-0.5 text-[11px] text-muted">
                          {new Date(h.at).toLocaleString(isAr ? "ar" : "en-US")}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Save footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-subtle px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-semibold text-foreground-secondary transition hover:bg-background"
              >
                {t("إلغاء", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-soft)] transition hover:bg-primary-hover"
              >
                <Save className="h-4 w-4" />
                {t("حفظ", "Save")}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
