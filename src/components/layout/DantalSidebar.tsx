"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  CreditCard,
  BarChart3,
  Package,
  Building2,
  Sparkles,
  Settings,
  HardDrive,
  Info,
  User,
  Pill,
  Bell,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Stethoscope,
  PanelLeftClose,
  X,
  type LucideIcon,
} from "lucide-react";
import { SECRETARY_PAGES, IMPLEMENTED_PAGES, APP_BRAND } from "@/lib/constants";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { DantalLogo } from "@/components/layout/DantalLogo";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/types/session";
import type { Role } from "@/types/session";

type NavItemDef = {
  id: string;
  ar: string;
  en: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
};

const STAFF_PRIMARY: NavItemDef[] = [
  { id: "dashboard", ar: "لوحة التحكم", en: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", ar: "المواعيد", en: "Appointments", icon: Calendar },
  { id: "patients", ar: "المرضى", en: "Patients", icon: Users },
  { id: "staff", ar: "الكادر", en: "Doctors", icon: Stethoscope, ownerOnly: true },
  { id: "plans", ar: "خطط العلاج", en: "Treatments", icon: ClipboardList },
  { id: "cases", ar: "السجلات الطبية", en: "Medical Records", icon: FileText },
  { id: "finance", ar: "المدفوعات", en: "Payments", icon: CreditCard, ownerOnly: true },
  { id: "reports", ar: "التقارير", en: "Reports", icon: BarChart3, ownerOnly: true },
];

const STAFF_SECONDARY: NavItemDef[] = [
  { id: "inventory", ar: "المخزون", en: "Inventory", icon: Package },
  { id: "services", ar: "قائمة الخدمات", en: "Services", icon: ListChecks, ownerOnly: true },
  { id: "vendors", ar: "جهات التعامل", en: "Branches", icon: Building2 },
  { id: "insights", ar: "المساعد الذكي", en: "AI Assistant", icon: Sparkles, ownerOnly: true },
  { id: "recall", ar: "المتابعة", en: "Recall", icon: Bell, ownerOnly: true },
  { id: "prescriptions", ar: "الوصفات", en: "Prescriptions", icon: Pill },
  { id: "settings", ar: "الإعدادات", en: "Settings", icon: Settings },
  { id: "backup", ar: "النسخ الاحتياطي", en: "Backup", icon: HardDrive, ownerOnly: true },
  { id: "about", ar: "عن التطبيق", en: "About", icon: Info },
];

const PATIENT_NAV: NavItemDef[] = [
  { id: "myfile", ar: "ملفي الطبي", en: "My File", icon: User },
  { id: "myappts", ar: "مواعيدي", en: "My Appointments", icon: Calendar },
  { id: "myrx", ar: "وصفاتي", en: "My Prescriptions", icon: Pill },
  { id: "settings", ar: "الإعدادات", en: "Settings", icon: Settings },
  { id: "about", ar: "عن التطبيق", en: "About", icon: Info },
];

const ROLE_LABEL: Record<Role, { ar: string; en: string }> = {
  owner: { ar: "مدير", en: "Admin" },
  doctor: { ar: "طبيب", en: "Doctor" },
  reception: { ar: "استقبال", en: "Reception" },
  secretary: { ar: "سكرتير", en: "Secretary" },
  patient: { ar: "مريض", en: "Patient" },
};

function filterNav(items: NavItemDef[], user: SessionUser) {
  return items.filter((item) => {
    if (item.ownerOnly && user.role !== "owner") return false;
    if (user.role === "secretary" && !SECRETARY_PAGES.includes(item.id)) return false;
    return true;
  });
}

function SidebarNavItem({
  item,
  active,
  collapsed,
  label,
}: {
  item: NavItemDef;
  active: boolean;
  collapsed: boolean;
  label: string;
}) {
  const Icon = item.icon;
  const implemented = IMPLEMENTED_PAGES.has(item.id);
  const href = `/${item.id}`;

  const inner = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-95" strokeWidth={1.75} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{label}</span>
          {active && <ChevronLeft className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
        </>
      )}
    </>
  );

  const className = cn(
    "dantal-focus group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white transition-all duration-200",
    collapsed && "justify-center px-2",
    active
      ? "bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(0,0,0,0.12)]"
      : "text-white/85 hover:bg-white/10 hover:text-white"
  );

  if (!implemented) {
    return (
      <li>
        <span className={cn(className, "cursor-not-allowed opacity-40")} title="قريباً">
          {inner}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} className={className} title={collapsed ? label : undefined}>
        {inner}
      </Link>
    </li>
  );
}

function ThemeSwitch({ collapsed }: { collapsed: boolean }) {
  const theme = useUiPrefsStore((s) => s.theme);
  const toggleTheme = useUiPrefsStore((s) => s.toggleTheme);
  const lang = useUiPrefsStore((s) => s.lang);
  const isLight = theme === "light";

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="dantal-focus mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-white/90 hover:bg-white/10"
        aria-label={isLight ? "Dark mode" : "Light mode"}
      >
        {isLight ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-1 py-1">
      <div className="flex items-center gap-2.5 text-white/90">
        {isLight ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        <span className="text-sm font-medium">
          {isLight
            ? lang === "ar"
              ? "الوضع الفاتح"
              : "Light Mode"
            : lang === "ar"
              ? "الوضع الداكن"
              : "Dark Mode"}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggleTheme}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          isLight ? "bg-white/35" : "bg-white/20"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            isLight ? "start-[calc(100%-1.375rem)]" : "start-0.5"
          )}
        />
      </button>
    </div>
  );
}

export function DantalSidebar({
  user,
  clinicName,
}: {
  user: SessionUser;
  clinicName: string;
}) {
  const pathname = usePathname();
  const collapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useLayoutStore((s) => s.mobileSidebarOpen);
  const toggle = useLayoutStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useLayoutStore((s) => s.toggleMobileSidebar);
  const setMobileSidebarOpen = useLayoutStore((s) => s.setMobileSidebarOpen);
  const lang = useUiPrefsStore((s) => s.lang);
  const isMobile = useIsMobile();
  const showCollapsed = collapsed && !isMobile;

  const isPatient = user.role === "patient";
  const primary = isPatient ? PATIENT_NAV : filterNav(STAFF_PRIMARY, user);
  const secondary = isPatient ? [] : filterNav(STAFF_SECONDARY, user);
  const roleLabel = ROLE_LABEL[user.role]?.[lang] || user.role;

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  const sidebar = (
    <aside
      className={cn(
        "dantal-sidebar z-40 flex h-screen shrink-0 flex-col bg-[#0052FF] transition-[width,transform] duration-300 ease-out",
        "shadow-[4px_0_32px_rgba(0,82,255,0.18)]",
        isMobile
          ? "w-[min(100vw,320px)] min-w-[min(100vw,320px)]"
          : showCollapsed
            ? "w-[76px] min-w-[76px]"
            : "w-[272px] min-w-[272px]",
        isMobile
          ? cn(
              "fixed inset-y-0 start-0 z-50 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
            )
          : "sticky top-0 translate-x-0 rounded-s-[22px]"
      )}
    >
      <div className={cn("flex items-start gap-3 px-4 pb-2 pt-5", showCollapsed && "flex-col items-center px-2")}>
        <div className={cn("flex min-w-0 flex-1 items-center gap-3", showCollapsed && "flex-col")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/15">
            <DantalLogo className="h-6 w-6" />
          </div>
          {!showCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold tracking-tight text-white">{APP_BRAND}</div>
              <div className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-white/65">
                {lang === "ar" ? clinicName || "إدارة العيادة" : "Dental Clinic Management"}
              </div>
            </div>
          )}
        </div>
        {!showCollapsed && (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "dantal-focus h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
              isMobile ? "hidden" : "flex"
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className={cn(
            "dantal-focus flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
            !isMobile && "hidden"
          )}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        <ul className="space-y-0.5">
          {primary.map((item) => {
            const href = `/${item.id}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const label = lang === "en" ? item.en : item.ar;
            return (
              <SidebarNavItem
                key={item.id}
                item={item}
                active={active}
                collapsed={showCollapsed}
                label={label}
              />
            );
          })}
        </ul>

        {secondary.length > 0 && (
          <>
            {!showCollapsed && (
              <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                {lang === "ar" ? "المخزون والمزيد" : "Inventory & More"}
              </div>
            )}
            {showCollapsed && <div className="my-3 border-t border-white/10" />}
            <ul className="space-y-0.5">
              {secondary.map((item) => {
                const href = `/${item.id}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const label = lang === "en" ? item.en : item.ar;
                return (
                  <SidebarNavItem
                    key={item.id}
                    item={item}
                    active={active}
                    collapsed={showCollapsed}
                    label={label}
                  />
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className={cn("mt-auto space-y-3 px-3 pb-4 pt-2", showCollapsed && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-[#0046DC]/80 px-3 py-2.5 ring-1 ring-white/10",
            showCollapsed && "justify-center px-2"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 ring-2 ring-white/20">
            <span className="text-sm font-bold text-white">
              {user.name
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          {!showCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                <div className="truncate text-xs text-white/60">{roleLabel}</div>
              </div>
              <ChevronLeft className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
            </>
          )}
        </div>

        <ThemeSwitch collapsed={showCollapsed} />

        {!isMobile && (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "dantal-focus flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white",
              showCollapsed && "px-0"
            )}
          >
            {showCollapsed ? (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            ) : (
              <>
                <PanelLeftClose className="h-[18px] w-[18px]" />
                <span>{lang === "ar" ? "طي القائمة" : "Collapse Sidebar"}</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className={cn("shrink-0", isMobile && "w-0")}>
      {isMobile && mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}
      {sidebar}
    </div>
  );
}
