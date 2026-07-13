"use client";

import { Delete, RotateCcw } from "lucide-react";
import { fmtMoney } from "@/lib/format";

const ROW1_SHORTCUT = { label: "1K", value: 1_000 } as const;
const ROW2_SHORTCUT = { label: "10K", value: 10_000 } as const;
const ROW3_SHORTCUT = { label: "100K", value: 100_000 } as const;
const ROW4_SHORTCUTS = [
  { label: "000", factor: 1_000 },
  { label: "0000", factor: 10_000 },
  { label: "00000", factor: 100_000 },
  { label: "1M", value: 1_000_000 },
] as const;

export function QfAmountStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  function appendDigit(d: number) {
    onChange(value === 0 ? d : Number(String(value) + String(d)));
  }

  function multiplyZeros(factor: number) {
    if (value === 0) return;
    onChange(value * factor);
  }

  function setShortcut(amount: number) {
    onChange(amount);
  }

  function backspace() {
    const str = String(value);
    onChange(str.length <= 1 ? 0 : Number(str.slice(0, -1)));
  }

  function clear() {
    onChange(0);
  }

  return (
    <div className="qf-amt-keypad">
      <div className="qf-amt-display">{fmtMoney(value)}</div>
      <div className="qf-amt-grid">
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(1)}>
          1
        </button>
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(2)}>
          2
        </button>
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(3)}>
          3
        </button>
        <button type="button" className="qf-amt-key qf-amt-short" onClick={() => setShortcut(ROW1_SHORTCUT.value)}>
          {ROW1_SHORTCUT.label}
        </button>

        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(4)}>
          4
        </button>
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(5)}>
          5
        </button>
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(6)}>
          6
        </button>
        <button type="button" className="qf-amt-key qf-amt-short" onClick={() => setShortcut(ROW2_SHORTCUT.value)}>
          {ROW2_SHORTCUT.label}
        </button>

        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(7)}>
          7
        </button>
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(8)}>
          8
        </button>
        <button type="button" className="qf-amt-key qf-amt-digit" onClick={() => appendDigit(9)}>
          9
        </button>
        <button type="button" className="qf-amt-key qf-amt-short" onClick={() => setShortcut(ROW3_SHORTCUT.value)}>
          {ROW3_SHORTCUT.label}
        </button>

        {ROW4_SHORTCUTS.map((s) =>
          "factor" in s ? (
            <button key={s.label} type="button" className="qf-amt-key qf-amt-zero" onClick={() => multiplyZeros(s.factor)}>
              {s.label}
            </button>
          ) : (
            <button key={s.label} type="button" className="qf-amt-key qf-amt-short" onClick={() => setShortcut(s.value)}>
              {s.label}
            </button>
          )
        )}

        <button type="button" className="qf-amt-key qf-amt-action qf-amt-action-wide" onClick={backspace} aria-label="حذف رقم">
          <Delete className="h-4 w-4" />
        </button>
        <button type="button" className="qf-amt-key qf-amt-action qf-amt-action-wide" onClick={clear} aria-label="مسح الكل">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
