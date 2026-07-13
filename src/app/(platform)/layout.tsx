"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogOut, Shield } from "lucide-react";
import { Cloud } from "@/lib/cloud";
import { isBackendEnabled } from "@/lib/backend";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function guard() {
      if (!isBackendEnabled() || !Cloud.loggedIn()) {
        router.replace("/login");
        return;
      }
      try {
        const profile = await Cloud.me();
        if (!Cloud.isSuperAdmin(profile.roles)) {
          router.replace("/login");
          return;
        }
        setEmail(profile.email);
        setReady(true);
      } catch {
        Cloud.logout();
        router.replace("/login");
      }
    }
    guard();
  }, [router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#f0f5f7]">
      <header className="border-b border-[#d1dde3] bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#366F7F] text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#366F7F]">لوحة تحكم المنصة</p>
              <p className="text-xs text-[#6b7c85]">إدارة العيادات والتراخيص</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/platform/clinics"
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[#366F7F] hover:bg-[#eaf3f5] sm:flex"
            >
              <Building2 className="h-4 w-4" />
              العيادات
            </Link>
            <span className="hidden text-xs text-[#6b7c85] sm:inline">{email}</span>
            <button
              type="button"
              onClick={() => {
                Cloud.logout();
                router.replace("/login");
              }}
              className="flex items-center gap-2 rounded-full border border-[#d1dde3] px-4 py-2 text-sm text-[#374151] hover:bg-[#f8fafb]"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
