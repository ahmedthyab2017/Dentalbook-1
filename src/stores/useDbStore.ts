"use client";

import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import type {
  DentistDb,
  Patient,
  Appointment,
  TreatmentPlan,
  Prescription,
  Payment,
  Expense,
  StaffMember,
  InventoryItem,
  Vendor,
  ServiceCatalogItem,
  CaseDoc,
  ClinicMeta,
  Settlement,
  AuditEntry,
  Reminder,
} from "@/types/db";
import { STORAGE_KEY } from "@/types/db";
import { createDefaultDb, seedDemoData } from "@/lib/default-db";
import { archiveAndZeroAccounts } from "@/lib/finance-utils";
import { uid } from "@/lib/id";

interface DbPersisted {
  db: DentistDb;
}

const legacyStorage: PersistStorage<DbPersisted> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const db = JSON.parse(raw) as DentistDb;
      return { state: { db }, version: 0 } satisfies StorageValue<DbPersisted>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(name, JSON.stringify(value.state.db));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

interface DbStore {
  db: DentistDb;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  ensureSeeded: () => void;

  addPatient: (p: Omit<Patient, "id" | "createdAt">) => Patient;
  updatePatient: (id: string, patch: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  addAppointment: (a: Omit<Appointment, "id" | "createdAt">) => Appointment;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addPlan: (p: Omit<TreatmentPlan, "id" | "createdAt">) => TreatmentPlan;
  updatePlan: (id: string, patch: Partial<TreatmentPlan>) => void;

  addPrescription: (rx: Omit<Prescription, "id" | "createdAt">) => Prescription;
  deletePrescription: (id: string) => void;

  addPayment: (pay: Omit<Payment, "id" | "createdAt">) => Payment;
  deletePayment: (id: string) => void;

  addExpense: (e: Omit<Expense, "id">) => Expense;
  deleteExpense: (id: string) => void;

  addStaff: (s: Omit<StaffMember, "id">) => StaffMember;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  addInventoryItem: (i: Omit<InventoryItem, "id">) => InventoryItem;
  updateInventoryItem: (id: string, patch: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  addVendor: (v: Omit<Vendor, "id">) => Vendor;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  addService: (s: Omit<ServiceCatalogItem, "id">) => ServiceCatalogItem;
  updateService: (id: string, patch: Partial<ServiceCatalogItem>) => void;
  deleteService: (id: string) => void;

  addCase: (c: Omit<CaseDoc, "id" | "createdAt">) => CaseDoc;
  updateCase: (id: string, patch: Partial<CaseDoc>) => void;
  deleteCase: (id: string) => void;

  addSettlement: (s: Settlement) => void;
  archiveAccounts: (by: string, reason: string) => void;
  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => void;
  updateMeta: (patch: Partial<ClinicMeta>) => void;

  logAudit: (entry: Omit<AuditEntry, "id" | "at">) => void;
  replaceDb: (next: DentistDb) => void;
}

export const useDbStore = create<DbStore>()(
  persist<DbStore, [], [], DbPersisted>(
    (set, get) => ({
      db: createDefaultDb(),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      ensureSeeded: () => {
        const { db } = get();
        if (!db.meta.demoSeeded && db.patients.length === 0) {
          set({ db: seedDemoData(db) });
        }
      },

      addPatient: (p) => {
        const patient: Patient = { ...p, id: uid("pt_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, patients: [...s.db.patients, patient] } }));
        get().logAudit({ who: "—", action: "create", entity: "patient", entityId: patient.id, ptId: patient.id });
        return patient;
      },
      updatePatient: (id, patch) => {
        set((s) => ({
          db: { ...s.db, patients: s.db.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)) },
        }));
        get().logAudit({ who: "—", action: "update", entity: "patient", entityId: id, ptId: id });
      },
      deletePatient: (id) => {
        set((s) => ({
          db: {
            ...s.db,
            patients: s.db.patients.filter((p) => p.id !== id),
            appointments: s.db.appointments.filter((a) => a.ptId !== id),
            plans: s.db.plans.filter((p) => p.ptId !== id),
            prescriptions: s.db.prescriptions.filter((r) => r.ptId !== id),
            payments: s.db.payments.filter((p) => p.ptId !== id),
          },
        }));
        get().logAudit({ who: "—", action: "delete", entity: "patient", entityId: id, ptId: id });
      },

      addAppointment: (a) => {
        const appt: Appointment = { ...a, id: uid("a_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, appointments: [...s.db.appointments, appt] } }));
        get().logAudit({ who: "—", action: "create", entity: "appointment", entityId: appt.id, ptId: appt.ptId });
        return appt;
      },
      updateAppointment: (id, patch) => {
        set((s) => ({
          db: { ...s.db, appointments: s.db.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)) },
        }));
      },
      deleteAppointment: (id) => {
        set((s) => ({ db: { ...s.db, appointments: s.db.appointments.filter((a) => a.id !== id) } }));
      },

      addPlan: (p) => {
        const plan: TreatmentPlan = { ...p, id: uid("pl_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, plans: [...s.db.plans, plan] } }));
        get().logAudit({ who: "—", action: "create", entity: "plan", entityId: plan.id, ptId: plan.ptId });
        return plan;
      },
      updatePlan: (id, patch) => {
        set((s) => ({ db: { ...s.db, plans: s.db.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)) } }));
      },

      addPrescription: (rx) => {
        const prescription: Prescription = { ...rx, id: uid("rx_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, prescriptions: [...s.db.prescriptions, prescription] } }));
        get().logAudit({ who: "—", action: "create", entity: "prescription", entityId: prescription.id, ptId: prescription.ptId });
        return prescription;
      },
      deletePrescription: (id) => {
        set((s) => ({ db: { ...s.db, prescriptions: s.db.prescriptions.filter((r) => r.id !== id) } }));
      },

      addPayment: (pay) => {
        const payment: Payment = { ...pay, id: uid("py_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, payments: [...s.db.payments, payment] } }));
        get().logAudit({ who: "—", action: "create", entity: "payment", entityId: payment.id, ptId: payment.ptId });
        return payment;
      },
      deletePayment: (id) => {
        set((s) => ({ db: { ...s.db, payments: s.db.payments.filter((p) => p.id !== id) } }));
      },

      addExpense: (e) => {
        const expense: Expense = { ...e, id: uid("e_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, expenses: [...s.db.expenses, expense] } }));
        return expense;
      },
      deleteExpense: (id) => {
        set((s) => ({ db: { ...s.db, expenses: s.db.expenses.filter((e) => e.id !== id) } }));
      },

      addStaff: (s) => {
        const member: StaffMember = { ...s, id: uid("st_"), createdAt: Date.now() };
        set((st) => ({ db: { ...st.db, staff: [...st.db.staff, member] } }));
        return member;
      },
      updateStaff: (id, patch) => {
        set((s) => ({ db: { ...s.db, staff: s.db.staff.map((m) => (m.id === id ? { ...m, ...patch } : m)) } }));
      },
      deleteStaff: (id) => {
        set((s) => ({ db: { ...s.db, staff: s.db.staff.filter((m) => m.id !== id) } }));
      },

      addInventoryItem: (i) => {
        const item: InventoryItem = { ...i, id: uid("it_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, inventory: [...s.db.inventory, item] } }));
        return item;
      },
      updateInventoryItem: (id, patch) => {
        set((s) => ({
          db: { ...s.db, inventory: s.db.inventory.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i)) },
        }));
      },
      deleteInventoryItem: (id) => {
        set((s) => ({ db: { ...s.db, inventory: s.db.inventory.filter((i) => i.id !== id) } }));
      },

      addVendor: (v) => {
        const vendor: Vendor = { ...v, id: uid("v_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, vendors: [...s.db.vendors, vendor] } }));
        return vendor;
      },
      updateVendor: (id, patch) => {
        set((s) => ({ db: { ...s.db, vendors: s.db.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)) } }));
      },
      deleteVendor: (id) => {
        set((s) => ({ db: { ...s.db, vendors: s.db.vendors.filter((v) => v.id !== id) } }));
      },

      addService: (s) => {
        const service: ServiceCatalogItem = { ...s, id: uid("sv_") };
        set((st) => ({ db: { ...st.db, services: [...st.db.services, service] } }));
        return service;
      },
      updateService: (id, patch) => {
        set((s) => ({ db: { ...s.db, services: s.db.services.map((sv) => (sv.id === id ? { ...sv, ...patch } : sv)) } }));
      },
      deleteService: (id) => {
        set((s) => ({ db: { ...s.db, services: s.db.services.filter((sv) => sv.id !== id) } }));
      },

      addCase: (c) => {
        const caseDoc: CaseDoc = { ...c, id: uid("cs_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, cases: [...s.db.cases, caseDoc] } }));
        return caseDoc;
      },
      updateCase: (id, patch) => {
        set((s) => ({ db: { ...s.db, cases: s.db.cases.map((c) => (c.id === id ? { ...c, ...patch } : c)) } }));
      },
      deleteCase: (id) => {
        set((s) => ({ db: { ...s.db, cases: s.db.cases.filter((c) => c.id !== id) } }));
      },

      addSettlement: (settlement) => {
        set((s) => ({ db: { ...s.db, settlements: [...s.db.settlements, settlement] } }));
      },

      archiveAccounts: (by, reason) => {
        set((s) => ({ db: archiveAndZeroAccounts(s.db, by, reason) }));
        get().logAudit({ who: by, action: "archive-zero", entity: "accounts", entityId: "all", note: reason });
      },

      addReminder: (r) => {
        const reminder: Reminder = { ...r, id: uid("rm_"), createdAt: Date.now() };
        set((s) => ({ db: { ...s.db, reminders: [...s.db.reminders, reminder] } }));
      },

      updateMeta: (patch) => {
        set((s) => ({ db: { ...s.db, meta: { ...s.db.meta, ...patch } } }));
      },

      logAudit: (entry) => {
        const full: AuditEntry = { ...entry, id: uid("a_"), at: Date.now() };
        set((s) => ({ db: { ...s.db, auditLog: [...s.db.auditLog, full] } }));
      },

      replaceDb: (next) => set({ db: next }),
    }),
    {
      name: STORAGE_KEY,
      storage: legacyStorage,
      partialize: (state) => ({ db: state.db }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
