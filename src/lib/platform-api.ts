import { Cloud } from "@/lib/cloud";

export type PlatformClinic = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  managerEmail: string | null;
  licenseTier: string | null;
  licenseActivated: boolean;
};

export type PlatformUserRole =
  | "ADMIN"
  | "DOCTOR"
  | "DENTIST"
  | "RECEPTIONIST"
  | "ASSISTANT"
  | "ACCOUNTANT";

export type PlatformUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  active: boolean;
  roles: PlatformUserRole[];
  createdAt: string;
};

export type PlatformClinicDetail = {
  clinic: PlatformClinic;
  users: PlatformUser[];
};

export type CreateClinicPayload = {
  clinicName: string;
  managerEmail: string;
  managerPassword: string;
  managerFirstName?: string;
  managerLastName?: string;
  managerPhone?: string;
  licenseKey?: string;
};

export type CreateClinicResult = {
  clinic: PlatformClinic;
  managerEmail: string;
  managerPassword: string;
  licenseActivated: boolean;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  role: PlatformUserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type UpdateUserPayload = {
  active?: boolean;
  role?: PlatformUserRole;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export const ROLE_LABELS: Record<PlatformUserRole, string> = {
  ADMIN: "مدير العيادة",
  DOCTOR: "طبيب",
  DENTIST: "طبيب أسنان",
  RECEPTIONIST: "استقبال",
  ASSISTANT: "مساعد",
  ACCOUNTANT: "محاسب",
};

export const ASSIGNABLE_ROLES: PlatformUserRole[] = [
  "ADMIN",
  "DOCTOR",
  "DENTIST",
  "RECEPTIONIST",
  "ASSISTANT",
  "ACCOUNTANT",
];

async function parseApi<T>(r: Response): Promise<T> {
  const d = await r.json();
  if (!r.ok) throw d;
  return d.data as T;
}

export const PlatformApi = {
  async listClinics(): Promise<PlatformClinic[]> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics", { headers: Cloud.headers(true) });
    return parseApi<PlatformClinic[]>(r);
  },

  async getClinic(clinicId: string): Promise<PlatformClinicDetail> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics/" + clinicId, { headers: Cloud.headers(true) });
    return parseApi<PlatformClinicDetail>(r);
  },

  async createClinic(payload: CreateClinicPayload): Promise<CreateClinicResult> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics", {
      method: "POST",
      headers: Cloud.headers(true),
      body: JSON.stringify(payload),
    });
    return parseApi<CreateClinicResult>(r);
  },

  async setClinicActive(clinicId: string, active: boolean): Promise<PlatformClinic> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics/" + clinicId, {
      method: "PATCH",
      headers: Cloud.headers(true),
      body: JSON.stringify({ active }),
    });
    return parseApi<PlatformClinic>(r);
  },

  async listUsers(clinicId: string): Promise<PlatformUser[]> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics/" + clinicId + "/users", {
      headers: Cloud.headers(true),
    });
    return parseApi<PlatformUser[]>(r);
  },

  async createUser(clinicId: string, payload: CreateUserPayload): Promise<PlatformUser> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics/" + clinicId + "/users", {
      method: "POST",
      headers: Cloud.headers(true),
      body: JSON.stringify(payload),
    });
    return parseApi<PlatformUser>(r);
  },

  async updateUser(clinicId: string, userId: string, payload: UpdateUserPayload): Promise<PlatformUser> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics/" + clinicId + "/users/" + userId, {
      method: "PATCH",
      headers: Cloud.headers(true),
      body: JSON.stringify(payload),
    });
    return parseApi<PlatformUser>(r);
  },

  async deleteUser(clinicId: string, userId: string): Promise<void> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/platform/clinics/" + clinicId + "/users/" + userId, {
      method: "DELETE",
      headers: Cloud.headers(true),
    });
    await parseApi<null>(r);
  },
};
