"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDbStore } from "@/stores/useDbStore";
import type { Patient } from "@/types/db";

// Ported from #mo-patient (app/index.html:694-776).
export function AddEditPatientModal({
  open,
  onClose,
  patient,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  patient?: Patient;
  onSaved?: (p: Patient) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={patient ? "تعديل مريض" : "مريض جديد"}>
      {/* Keyed by patient id so the form's local state resets whenever a
          different patient (or "new") is opened, without needing an effect. */}
      <PatientForm key={patient?.id || "new"} patient={patient} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function PatientForm({
  patient,
  onClose,
  onSaved,
}: {
  patient?: Patient;
  onClose: () => void;
  onSaved?: (p: Patient) => void;
}) {
  const addPatient = useDbStore((s) => s.addPatient);
  const updatePatient = useDbStore((s) => s.updatePatient);

  const [name, setName] = useState(patient?.name || "");
  const [phone, setPhone] = useState(patient?.phone || "");
  const [age, setAge] = useState(patient?.age ? String(patient.age) : "");
  const [gender, setGender] = useState<"male" | "female">(patient?.gender || "male");
  const [address, setAddress] = useState(patient?.address || "");
  const [allergies, setAllergies] = useState(patient?.allergies || "");
  const [medical, setMedical] = useState(patient?.medical || "");
  const [notes, setNotes] = useState(patient?.notes || "");

  function save() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      age: age ? Number(age) : undefined,
      gender,
      address: address.trim(),
      allergies: allergies.trim(),
      medical: medical.trim(),
      notes: notes.trim(),
    };
    if (patient) {
      updatePatient(patient.id, payload);
      onSaved?.({ ...patient, ...payload });
    } else {
      const created = addPatient(payload);
      onSaved?.(created);
    }
    onClose();
  }

  return (
    <>
      <div className="modal-body">
        <div className="form-grid">
          <div className="field">
            <label>الاسم الكامل</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>رقم الهاتف</label>
            <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>العمر</label>
            <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="field">
            <label>الجنس</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}>
              <option value="male">ذكر / Male</option>
              <option value="female">أنثى / Female</option>
            </select>
          </div>
          <div className="field span-2">
            <label>العنوان</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="field span-2">
            <label>الحساسية</label>
            <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          </div>
          <div className="field span-2">
            <label>التاريخ الطبي</label>
            <textarea rows={2} value={medical} onChange={(e) => setMedical(e.target.value)} />
          </div>
          <div className="field span-2">
            <label>ملاحظات</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>
          إلغاء
        </button>
        <button className="btn btn-primary" onClick={save}>
          حفظ
        </button>
      </div>
    </>
  );
}
