import { Cloud } from "@/lib/cloud";
import type { PlatformUser, PlatformUserRole } from "@/lib/platform-api";

export type CreateTeamMemberPayload = {
  email: string;
  password: string;
  role: PlatformUserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

async function parseApi<T>(r: Response): Promise<T> {
  const d = await r.json();
  if (!r.ok) throw d;
  return d.data as T;
}

export const ClinicTeamApi = {
  async list(): Promise<PlatformUser[]> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/clinic/team/users", { headers: Cloud.headers(true) });
    return parseApi<PlatformUser[]>(r);
  },

  async create(payload: CreateTeamMemberPayload): Promise<PlatformUser> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/clinic/team/users", {
      method: "POST",
      headers: Cloud.headers(true),
      body: JSON.stringify(payload),
    });
    return parseApi<PlatformUser>(r);
  },
};
