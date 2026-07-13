// Mirrors the legacy `DB` object shape from app/app.js:1199-1244.
// Kept intentionally loose (optional fields, string unions with a trailing
// `string` fallback where the legacy app didn't enforce an enum) so that
// real-world localStorage data saved by the vanilla app always parses.

export interface AiConfig {
  enabled: boolean;
  provider: string;
  endpoint: string;
  model: string;
  apiKey: string;
}

export interface PortalConfig {
  doctorWa: string;
  clinicWa: string;
  mapsUrl: string;
  hours: string;
  bookingTo: string;
  patientUrl?: string;
}

export type LicenseTier = "solo" | "duo" | "clinic";

export interface LicenseInfo {
  tier: LicenseTier;
  key: string;
  activatedAt: number | null;
}

export interface CloudSyncConfig {
  apiUrl: string;
  email: string;
  passphrase: string;
  autoSync: boolean;
  lastSync?: number;
}

export interface AdEntry {
  type: "office" | "lab" | "xray";
  enabled: boolean;
  name: string;
  phone: string;
  address: string;
  note: string;
}

export interface ClinicPins {
  owner?: string;
  reception?: string;
  secretary?: string;
}

export interface ClinicMeta {
  clinicName: string;
  clinicNameEn: string;
  clinicAddress: string;
  clinicPhone: string;
  ownerPin: string;
  receptionPin: string;
  secretaryPin: string;
  idleLockMin: number;
  doctorName?: string;
  ai: AiConfig;
  portal: PortalConfig;
  license: LicenseInfo;
  cloud: CloudSyncConfig;
  lastBackup: number | null;
  accountsBaselineAt?: number;
  ads: AdEntry[];
  pins?: ClinicPins;
  demoSeeded?: boolean;
  migrations?: Record<string, boolean>;
}

export type ToothState =
  | "healthy"
  | "decay"
  | "filling"
  | "rct"
  | "crown"
  | "missing";

export interface ConsentRecord {
  type: string;
  title: string;
  text: string;
  agreedAt: number;
  signature?: string;
}

export interface ReferralRecord {
  id: string;
  ptId: string;
  specialty: string;
  toDoctor?: string;
  reason?: string;
  urgency?: string;
  at: number;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: "male" | "female";
  address?: string;
  allergies?: string;
  medical?: string;
  notes?: string;
  chart?: Record<string, ToothState>;
  consents?: ConsentRecord[];
  createdAt: number;
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Appointment {
  id: string;
  ptId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  purpose?: string;
  status: AppointmentStatus;
  note?: string;
  finishReason?: string;
  finishNote?: string;
  completedAt?: number;
  createdAt: number;
  updatedAt?: number;
}

export type StaffRole = "doctor" | "reception" | "assistant" | "owner";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone?: string;
  commissionPct?: number;
  pin?: string;
  isOwner?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PlanSession {
  idx: number;
  done?: boolean;
  completed?: boolean;
  date?: string;
  completedAt?: number;
  notes?: string;
  paid?: number;
}

export type PlanStatus = "active" | "completed" | "cancelled";

export interface PlanDiscount {
  amount: number;
  reason: string;
  at: number;
}

export interface TreatmentPlan {
  id: string;
  ptId: string;
  type: string;
  tooth?: string;
  teeth?: string[];
  doctorId?: string;
  sessions: PlanSession[];
  totalCost: number;
  notes?: string;
  status: PlanStatus;
  discounts?: PlanDiscount[];
  completedAt?: number;
  createdAt: number;
}

export interface RxMed {
  name: string;
  dose?: string;
  freq?: string;
  duration?: string;
}

export interface Prescription {
  id: string;
  ptId: string;
  doctorId?: string;
  date: string;
  meds: RxMed[];
  tips?: { ar?: string; en?: string };
  notes?: string;
  createdAt: number;
}

export interface Payment {
  id: string;
  ptId: string;
  amount: number;
  date: string;
  method: "cash" | "card" | "transfer" | "zaincash" | string;
  note?: string;
  planId?: string;
  sessionIdx?: number;
  createdAt?: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  notes?: string;
  createdAt?: number;
}

export interface Vendor {
  id: string;
  name: string;
  category?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  qty?: number;
  unit?: string;
  minQty?: number;
  cost?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface ServiceCatalogItem {
  id: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  defaultCost?: number;
  price?: number;
  sessions?: number;
  builtIn?: boolean;
}

export type CaseCategory = "implant" | "ortho" | "smile" | "general";

export interface CasePhoto {
  id: string;
  dataUrl: string;
  note?: string;
  isFlagship?: boolean;
}

export interface CaseDoc {
  id: string;
  ptId: string;
  ptName: string;
  category: CaseCategory;
  treatmentType?: string;
  date: string;
  notes?: string;
  photosBefore: CasePhoto[];
  photosAfter: CasePhoto[];
  createdAt: number;
}

export type ReminderRecipient = "inApp" | "wa" | "notif";

export interface Reminder {
  id: string;
  ptId: string;
  ptName: string;
  content: string;
  dueAt: number;
  recipients: ReminderRecipient[];
  done: boolean;
  createdAt: number;
  doneAt?: number;
}

export interface VoiceNote {
  id: string;
  ptId: string;
  planId?: string;
  sessionIdx?: number;
  dataUrl: string;
  transcript?: string;
  duration?: number;
  createdAt: number;
}

export interface AuditEntry {
  id: string;
  at: number;
  who: string;
  whoRole?: string;
  action: string;
  entity: string;
  entityId: string;
  ptId?: string | null;
  before?: string | null;
  after?: string | null;
  note?: string;
}

export interface Settlement {
  id: string;
  doctorId: string;
  doctorName: string;
  at: number;
  by: string;
  sinceAt: number;
  gross: number;
  doctorShare: number;
  clinicShare: number;
  commissionPct: number;
  mode: string;
  note?: string;
}

export interface Archive {
  id: string;
  at: number;
  by: string;
  reason: string;
  settlements: Settlement[];
  outstanding: unknown[];
  totals: Record<string, number>;
}

export interface DentistDb {
  meta: ClinicMeta;
  patients: Patient[];
  appointments: Appointment[];
  staff: StaffMember[];
  plans: TreatmentPlan[];
  prescriptions: Prescription[];
  payments: Payment[];
  expenses: Expense[];
  vendors: Vendor[];
  inventory: InventoryItem[];
  services: ServiceCatalogItem[];
  cases: CaseDoc[];
  reminders: Reminder[];
  voiceNotes: VoiceNote[];
  auditLog: AuditEntry[];
  settlements: Settlement[];
  archives: Archive[];
  referrals?: ReferralRecord[];
}

export const STORAGE_KEY = "mukhtasar_v1";
