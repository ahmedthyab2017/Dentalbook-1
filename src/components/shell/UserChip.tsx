import { initials } from "@/lib/format";
import type { SessionUser } from "@/types/session";

const ROLE_LABEL_AR: Record<SessionUser["role"], string> = {
  owner: "المدير",
  doctor: "طبيب",
  reception: "الاستقبال",
  secretary: "سكرتير",
  patient: "مريض",
};

export function UserChip({ user }: { user: SessionUser }) {
  return (
    <div className="user-chip">
      <span className="user-avatar">{initials(user.name)}</span>
      <div>
        <div className="user-name">{user.name}</div>
        <div className="user-role">{ROLE_LABEL_AR[user.role]}</div>
      </div>
    </div>
  );
}
