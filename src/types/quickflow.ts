export type QfAction = "continue" | "new" | "complex" | "rxOnly" | "apptOnly";

export interface QfSelectedTooth {
  tooth: string;
  treatmentId: string;
  cost: number;
  sessions: number;
}

export interface QfReminderDraft {
  dueAt: number;
  content: string;
  recipients: ("inApp" | "wa" | "notif")[];
}

export interface QuickFlowState {
  step: 1 | 2 | 3 | 4;
  searchQ: string;
  ptId: string;
  ptName: string;
  action: QfAction | null;
  planId: string | null;
  sessionIdx: number;
  sessionDone: boolean;
  sessionExtraAmount: number;
  paymentOnlyMode: boolean;
  selectedTeeth: QfSelectedTooth[];
  activeTooth: string | null;
  amountPaid: number;
  totalCost: number;
  sessionsExpected: number;
  noteText: string;
  firstSessionDone: boolean;
  complexCategory: "implant" | "ortho" | "smile";
  complexClass: string;
  installments: number;
  savedPlanIds: string[];
  rxMedName: string;
  rxDose: string;
  rxDuration: string;
  apptDate: string;
  apptTime: string;
  apptPurpose: string;
  reminderText: string;
  reminderDue: string;
  reminder: QfReminderDraft | null;
  dictating: boolean;
  followupFees: number;
  paidPrev: number;
  pendingActions?: { rxDone: boolean; printDone: boolean; apptDone: boolean; waDone: boolean };
  savedRxId?: string;
  rxSuggestedType?: string;
  newPtDraft: null | {
    name: string;
    phone: string;
    age: string;
    gender: "male" | "female";
    allergies: string;
    medical: string;
  };
}

export function createQuickFlowState(): QuickFlowState {
  return {
    step: 1,
    searchQ: "",
    ptId: "",
    ptName: "",
    action: null,
    planId: null,
    sessionIdx: 0,
    sessionDone: true,
    sessionExtraAmount: 0,
    paymentOnlyMode: false,
    selectedTeeth: [],
    activeTooth: null,
    amountPaid: 0,
    totalCost: 0,
    sessionsExpected: 4,
    noteText: "",
    firstSessionDone: true,
    complexCategory: "implant",
    complexClass: "",
    installments: 0,
    savedPlanIds: [],
    rxMedName: "",
    rxDose: "",
    rxDuration: "",
    apptDate: "",
    apptTime: "10:00",
    apptPurpose: "",
    reminderText: "",
    reminderDue: "",
    reminder: null,
    dictating: false,
    followupFees: 0,
    paidPrev: 0,
    newPtDraft: null,
  };
}
