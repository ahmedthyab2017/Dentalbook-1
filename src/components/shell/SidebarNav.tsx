"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_MAP, SECRETARY_PAGES, IMPLEMENTED_PAGES } from "@/lib/constants";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Role } from "@/types/session";
import type { NavGroupKey } from "@/types/nav";

// Ported from buildNav() (app/app.js:2160+). Icons are attached here by id
// since NAV_MAP itself is icon-agnostic (see lib/constants.ts).
const ICON_BY_ID: Record<string, IconName> = {
  dashboard: "home",
  patients: "users",
  appointments: "calendar",
  plans: "clipboard",
  cases: "camera",
  prescriptions: "pill",
  tasks: "clipboard",
  finance: "wallet",
  reports: "chart",
  insights: "trending",
  recall: "bell",
  staff: "stethoscope",
  services: "tooth",
  inventory: "box",
  vendors: "building",
  backup: "save",
  settings: "gear",
  about: "info",
  myfile: "user",
  myappts: "calendar",
  myrx: "pill",
};

const GROUP_ORDER: NavGroupKey[] = ["main", "clinical", "financial", "mgmt", "other"];

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const side = role === "patient" ? "patient" : "staff";
  const groups = NAV_MAP[side];

  return (
    <nav className="sidebar-nav">
      {GROUP_ORDER.map((groupKey) => {
        const items = (groups[groupKey] || []).filter((item) => {
          if (item.ownerOnly && role !== "owner") return false;
          if (role === "secretary" && !SECRETARY_PAGES.includes(item.id)) return false;
          return true;
        });
        if (items.length === 0) return null;
        return (
          <div className="nav-group" key={groupKey}>
            {items.map((item) => {
              const implemented = IMPLEMENTED_PAGES.has(item.id);
              const href = `/${item.id}`;
              const active = pathname === href || pathname.startsWith(href + "/");
              if (!implemented) {
                return (
                  <div
                    key={item.id}
                    className="nav-item"
                    style={{ opacity: 0.4, cursor: "default" }}
                    title="قريباً · Coming soon"
                  >
                    <span className="nav-item-icon">
                      <Icon name={ICON_BY_ID[item.id] || "info"} />
                    </span>
                    <span className="nav-item-text">
                      <span className="nav-item-ar">{item.ar}</span>
                      <span className="nav-item-en">{item.en}</span>
                    </span>
                  </div>
                );
              }
              return (
                <Link key={item.id} href={href} className={`nav-item${active ? " active" : ""}`}>
                  <span className="nav-item-icon">
                    <Icon name={ICON_BY_ID[item.id] || "info"} />
                  </span>
                  <span className="nav-item-text">
                    <span className="nav-item-ar">{item.ar}</span>
                    <span className="nav-item-en">{item.en}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
