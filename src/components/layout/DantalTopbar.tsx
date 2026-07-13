"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  MessageSquare,
  Moon,
  Sun,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  Download,
  MoreVertical,
} from "lucide-react";
import { SearchInput, IconButton, Avatar } from "@/components/ds";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useDbStore } from "@/stores/useDbStore";
import { Cloud } from "@/lib/cloud";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/cn";

export function DantalTopbar({
  title,
  search,
}: {
  title?: string;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
}) {
  const router = useRouter();
  const theme = useUiPrefsStore((s) => s.theme);
  const toggleTheme = useUiPrefsStore((s) => s.toggleTheme);
  const toggleLang = useUiPrefsStore((s) => s.toggleLang);
  const lang = useUiPrefsStore((s) => s.lang);
  const logout = useSessionStore((s) => s.logout);
  const user = useSessionStore((s) => s.user);
  const clinicName = useDbStore((s) => s.db.meta.clinicName);
  const toggleMobileSidebar = useLayoutStore((s) => s.toggleMobileSidebar);
  const mobileSidebarOpen = useLayoutStore((s) => s.mobileSidebarOpen);
  const isMobile = useIsMobile();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const canInstall = typeof window !== "undefined" && !!deferredPrompt;

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [moreOpen]);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setMoreOpen(false);
  }

  function signOut() {
    if (Cloud.loggedIn()) Cloud.logout();
    logout();
    router.push("/login");
  }

  const mobileMenuItems = [
    canInstall
      ? { label: "تثبيت التطبيق", icon: Download, onClick: handleInstall }
      : null,
    { label: "الرسائل", icon: MessageSquare, onClick: () => setMoreOpen(false) },
    { label: "الإشعارات", icon: Bell, onClick: () => setMoreOpen(false) },
    { label: theme === "light" ? "الوضع الداكن" : "الوضع الفاتح", icon: theme === "light" ? Moon : Sun, onClick: () => { toggleTheme(); setMoreOpen(false); } },
    { label: "الإعدادات", icon: Settings, onClick: () => { router.push("/settings"); setMoreOpen(false); } },
    { label: "تسجيل الخروج", icon: LogOut, onClick: signOut, danger: true },
  ].filter(Boolean) as { label: string; icon: typeof Settings; onClick: () => void; danger?: boolean }[];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top)]">
      {isMobile && (
        <button
          type="button"
          className="dantal-touch dantal-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-primary/20 bg-primary/10 text-primary"
          aria-label={mobileSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {title && (
        <h1
          className={cn(
            "min-w-0 font-semibold text-foreground",
            isMobile ? "flex-1 truncate text-base" : "hidden text-lg md:block"
          )}
        >
          {title}
        </h1>
      )}

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2 md:justify-between md:gap-4">
        {search ? (
          <SearchInput
            placeholder={search.placeholder || "بحث…"}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className="hidden max-w-xs md:flex"
          />
        ) : (
          <SearchInput placeholder="بحث عن مريض، موعد…" className="hidden md:flex" />
        )}

        <button
          type="button"
          className="dantal-focus hidden items-center gap-2 rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-border-subtle lg:flex"
        >
          <span className="max-w-[140px] truncate">{clinicName}</span>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {canInstall && (
            <IconButton label="Install app" onClick={handleInstall} className="hidden sm:inline-flex">
              <Download className="h-[18px] w-[18px]" />
            </IconButton>
          )}
          <IconButton label="Language" onClick={toggleLang} className="h-10 w-10 sm:h-9 sm:w-9">
            <span className="text-xs font-bold">{lang === "ar" ? "EN" : "ع"}</span>
          </IconButton>

          {!isMobile && (
            <>
              <IconButton label="Messages">
                <MessageSquare className="h-[18px] w-[18px]" />
              </IconButton>
              <IconButton label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
              </IconButton>
              <IconButton label="Theme" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
              </IconButton>
              <IconButton label="Settings" onClick={() => router.push("/settings")}>
                <Settings className="h-[18px] w-[18px]" />
              </IconButton>
              <IconButton label="Sign out" onClick={signOut} variant="ghost">
                <LogOut className="h-[18px] w-[18px]" />
              </IconButton>
              {user && (
                <div className="ms-2 hidden items-center gap-2 rounded-[var(--radius-button)] border border-border px-2 py-1 sm:flex">
                  <Avatar name={user.name} size="sm" />
                  <span className="max-w-[100px] truncate text-sm font-medium text-foreground">{user.name}</span>
                </div>
              )}
            </>
          )}

          {isMobile && (
            <div ref={moreRef} className="relative">
              <IconButton
                label="المزيد"
                className="h-10 w-10"
                onClick={() => setMoreOpen((open) => !open)}
              >
                <MoreVertical className="h-[18px] w-[18px]" />
              </IconButton>
              {moreOpen && (
                <div className="absolute end-0 top-[calc(100%+8px)] z-50 min-w-[210px] overflow-hidden rounded-[14px] border border-border bg-surface py-1 shadow-[var(--shadow-soft-lg)]">
                  {mobileMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        className={cn(
                          "dantal-focus flex w-full items-center gap-3 px-4 py-3 text-sm",
                          item.danger ? "text-danger hover:bg-danger-muted" : "text-foreground hover:bg-border-subtle"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
