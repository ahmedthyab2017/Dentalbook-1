// Default DB shape, ported from app/app.js:1199-1244 (DB object literal).
// Used to initialize a fresh clinic (first run, no localStorage data yet).

import type { DentistDb } from "@/types/db";
import { uid } from "./id";

export function createDefaultDb(): DentistDb {
  return {
    meta: {
      clinicName: "سوران دنتال",
      clinicNameEn: "Soran Dental",
      clinicAddress: "الفلوجة — العراق",
      clinicPhone: "009647810151042",
      ownerPin: "1234",
      receptionPin: "5678",
      secretaryPin: "4321",
      idleLockMin: 5,
      ai: {
        enabled: false,
        provider: "gemini",
        endpoint: "",
        model: "gemini-2.0-flash",
        apiKey: "",
      },
      portal: {
        doctorWa: "07506306003",
        clinicWa: "07810151042",
        mapsUrl: "",
        hours: "9 صباحاً - 9 مساءً",
        bookingTo: "clinic",
      },
      license: { tier: "clinic", key: "", activatedAt: null },
      cloud: {
        apiUrl: (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "",
        email: "",
        passphrase: "",
        autoSync: false,
      },
      lastBackup: null,
      ads: [
        { type: "office", enabled: false, name: "", phone: "", address: "", note: "" },
        { type: "lab", enabled: false, name: "", phone: "", address: "", note: "" },
        { type: "xray", enabled: false, name: "", phone: "", address: "", note: "" },
      ],
      demoSeeded: false,
    },
    patients: [],
    appointments: [],
    staff: [
      {
        id: "owner",
        name: "د. أحمد عبيد",
        role: "doctor",
        phone: "009647810151042",
        commissionPct: 100,
        pin: "1234",
        isOwner: true,
      },
    ],
    plans: [],
    prescriptions: [],
    payments: [],
    expenses: [],
    vendors: [],
    inventory: [],
    services: [],
    cases: [],
    reminders: [],
    voiceNotes: [],
    auditLog: [],
    settlements: [],
    archives: [],
  };
}

/** Small demo dataset for local dev convenience (Phase 1 scope, not the full
 * legacy seed) — a handful of patients/appointments/plans/payments so the
 * Dashboard and Patients pages have something to render out of the box. */
export function seedDemoData(db: DentistDb): DentistDb {
  if (db.meta.demoSeeded || db.patients.length > 0) return db;

  const off = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  };

  const patients = [
    {
      id: uid("pt_"),
      name: "أحمد كريم",
      phone: "07701234567",
      age: 34,
      gender: "male" as const,
      address: "الفلوجة",
      allergies: "",
      medical: "",
      notes: "",
      chart: {},
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: uid("pt_"),
      name: "فاطمة علي",
      phone: "07709876543",
      age: 27,
      gender: "female" as const,
      address: "الرمادي",
      allergies: "بنسلين",
      medical: "",
      notes: "",
      chart: {},
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: uid("pt_"),
      name: "عمر حسين",
      phone: "07715558899",
      age: 41,
      gender: "male" as const,
      address: "بغداد",
      allergies: "",
      medical: "سكري",
      notes: "",
      chart: {},
      createdAt: Date.now() - 86400000 * 3,
    },
  ];

  const appointments = [
    {
      id: uid("ap_"),
      ptId: patients[0].id,
      date: off(0),
      time: "10:00",
      purpose: "فحص دوري",
      status: "scheduled" as const,
      createdAt: Date.now(),
    },
    {
      id: uid("ap_"),
      ptId: patients[1].id,
      date: off(0),
      time: "12:30",
      purpose: "تنظيف أسنان",
      status: "confirmed" as const,
      createdAt: Date.now(),
    },
  ];

  const plans = [
    {
      id: uid("pl_"),
      ptId: patients[0].id,
      type: "حشوة",
      teeth: ["16"],
      sessions: [
        { idx: 0, done: true, completed: true, date: off(-7), paid: 50000 },
        { idx: 1, done: false, completed: false, date: "", paid: 0 },
      ],
      totalCost: 100000,
      notes: "",
      status: "active" as const,
      createdAt: Date.now() - 86400000 * 7,
    },
  ];

  const payments = [
    {
      id: uid("pay_"),
      ptId: patients[0].id,
      amount: 50000,
      date: off(-7),
      method: "cash" as const,
      planId: plans[0].id,
      sessionIdx: 0,
      createdAt: Date.now() - 86400000 * 7,
    },
  ];

  return {
    ...db,
    patients,
    appointments,
    plans,
    payments,
    meta: { ...db.meta, demoSeeded: true },
  };
}
