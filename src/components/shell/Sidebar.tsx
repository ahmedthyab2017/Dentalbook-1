import { SidebarNav } from "./SidebarNav";
import { UserChip } from "./UserChip";
import type { SessionUser } from "@/types/session";

export function Sidebar({ user, clinicName }: { user: SessionUser; clinicName: string }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-logo">M</div>
        <div>
          <div className="sidebar-brand">المختصر</div>
          <div className="sidebar-sub">{clinicName}</div>
        </div>
      </div>
      <SidebarNav role={user.role} />
      <div className="sidebar-foot">
        <UserChip user={user} />
      </div>
    </aside>
  );
}
