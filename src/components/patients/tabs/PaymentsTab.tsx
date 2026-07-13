"use client";

import { useState } from "react";
import { useDbStore } from "@/stores/useDbStore";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { patientDebt } from "@/lib/patients";
import { fmtMoney, fmtDateShort, todayStr } from "@/lib/format";
import type { Patient, Payment } from "@/types/db";

const METHOD_LABEL: Record<string, string> = {
  cash: "نقداً",
  card: "بطاقة",
  transfer: "تحويل",
  zaincash: "زين كاش",
};

// Ported from profPaysHtml() (app/app.js:3629-3660) — first real use of
// the generic .data-table pattern.
export function PaymentsTab({ patient }: { patient: Patient }) {
  const db = useDbStore((s) => s.db);
  const addPayment = useDbStore((s) => s.addPayment);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [method, setMethod] = useState<Payment["method"]>("cash");
  const [note, setNote] = useState("");

  const list = db.payments
    .filter((p) => p.ptId === patient.id)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const total = list.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const debt = patientDebt(db, patient.id);

  function save() {
    if (!amount) return;
    addPayment({ ptId: patient.id, amount: Number(amount), date, method, note: note.trim() });
    setAmount("");
    setNote("");
    setModalOpen(false);
  }

  return (
    <>
      <div className="mini-stats-row">
        <div className="mini-stat success">
          <span>إجمالي المدفوع</span>
          <b>{fmtMoney(total)}</b>
        </div>
        <div className="mini-stat warn">
          <span>الرصيد المستحق</span>
          <b>{fmtMoney(debt)}</b>
        </div>
      </div>

      <div className="text-end mb-3 mt-3">
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          دفعة جديدة
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState>لا توجد دفعات</EmptyState>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المبلغ</th>
              <th>الطريقة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>{fmtDateShort(p.date)}</td>
                <td>
                  <b>{fmtMoney(p.amount)}</b>
                </td>
                <td>{METHOD_LABEL[p.method] || p.method}</td>
                <td>{p.note || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="دفعة جديدة">
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>المبلغ</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="field">
              <label>التاريخ</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label>طريقة الدفع</label>
              <select value={method} onChange={(e) => setMethod(e.target.value as Payment["method"])}>
                <option value="cash">نقداً</option>
                <option value="card">بطاقة</option>
                <option value="transfer">تحويل</option>
                <option value="zaincash">زين كاش</option>
              </select>
            </div>
            <div className="field span-2">
              <label>ملاحظات</label>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
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
