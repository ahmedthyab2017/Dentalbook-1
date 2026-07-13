import { Cloud } from "@/lib/cloud";
import type { DentistDb } from "@/types/db";

export const ClinicApi = {
  async exportAll(): Promise<Record<string, unknown>> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/clinic/export", {
      headers: Cloud.headers(true),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    return d;
  },

  async importAll(db: DentistDb): Promise<void> {
    const r = await Cloud.apiFetch(Cloud.v1() + "/clinic/import", {
      method: "POST",
      headers: Cloud.headers(true),
      body: JSON.stringify(db),
    });
    const d = await r.json();
    if (!r.ok) throw d;
  },
};
