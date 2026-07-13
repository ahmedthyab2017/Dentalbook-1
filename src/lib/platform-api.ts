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
};
