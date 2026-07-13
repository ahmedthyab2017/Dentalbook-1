import { Cloud } from "@/lib/cloud";

export interface CloudTask {
  id: string;
  title: string;
  note?: string;
  assignerName?: string;
  assigneeStaffId?: string;
  assigneeName?: string;
  dueAt?: number;
  status: "open" | "done";
}

export const TasksApi = {
  async list(params: Record<string, string> = {}): Promise<CloudTask[]> {
    if (!Cloud.configured() || !Cloud.loggedIn()) return [];
    const qs = new URLSearchParams(params).toString();
    const r = await Cloud.apiFetch(Cloud.v1() + "/tasks" + (qs ? "?" + qs : ""), { headers: Cloud.headers(true) });
    const d = await r.json();
    if (!r.ok) throw d;
    return d.tasks || [];
  },

  async create(task: Omit<CloudTask, "id" | "status"> & { status?: string }) {
    const r = await Cloud.apiFetch(Cloud.v1() + "/tasks", {
      method: "POST",
      headers: Cloud.headers(true),
      body: JSON.stringify(task),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    return d.task as CloudTask;
  },

  async setStatus(id: string, status: "open" | "done") {
    const r = await Cloud.apiFetch(Cloud.v1() + "/tasks/" + id, {
      method: "PATCH",
      headers: Cloud.headers(true),
      body: JSON.stringify({ status }),
    });
    const d = await r.json();
    if (!r.ok) throw d;
    return d.task as CloudTask;
  },

  async remove(id: string) {
    const r = await Cloud.apiFetch(Cloud.v1() + "/tasks/" + id, {
      method: "DELETE",
      headers: Cloud.headers(true),
    });
    if (!r.ok) throw await r.json();
    return true;
  },
};
