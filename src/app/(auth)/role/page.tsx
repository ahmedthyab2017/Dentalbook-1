"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { rolesAllowedByTier, backendProfileToSession } from "@/lib/auth";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { Cloud } from "@/lib/cloud";
import { isBackendAuthed } from "@/lib/backend";
import { Button, Card } from "@/components/ds";
import { fadeScaleIn, slideUp } from "@/lib/motion";
import type { Role } from "@/types/session";
import { cn } from "@/lib/cn";

const ROLE_BUTTONS: { role: Role; icon: string; ar: string; en: string }[] = [
  { role: "owner", icon: "👤", ar: "المدير", en: "Manager" },
  { role: "doctor", icon: "🩺", ar: "طبيب", en: "Doctor" },
  { role: "secretary", icon: "🗓️", ar: "سكرتير", en: "Secretary" },
  { role: "patient", icon: "🧑", ar: "مريض", en: "Patient" },
];

export default function RolePickerPage() {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const setSelectedRole = useSessionStore((s) => s.setSelectedRole);
  const setUser = useSessionStore((s) => s.setUser);
  const allowed = rolesAllowedByTier(db);

  useEffect(() => {
    if (!isBackendAuthed()) return;
    void Cloud.me()
      .then((profile) => {
        const sessionUser = backendProfileToSession(profile, useDbStore.getState().db);
        if (sessionUser) {
          setUser(sessionUser);
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        /* keep manual role/PIN flow for local-only */
      });
  }, [router, setUser]);

  function pick(role: Role) {
    setSelectedRole(role);
    router.push("/pin");
  }

  const visible = ROLE_BUTTONS.filter((b) => b.role === "patient" || allowed.includes(b.role));

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6 py-12">
      <motion.div className="w-full max-w-lg" {...fadeScaleIn}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">اختر الدور</h1>
          <p className="mt-2 text-sm text-muted">حدد دورك للدخول إلى النظام</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {visible.map((b, i) => (
            <motion.div key={b.role} {...slideUp} transition={{ delay: i * 0.05 }}>
              <div
                role="button"
                tabIndex={0}
                className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[var(--radius-card)]"
                onClick={() => pick(b.role)}
                onKeyDown={(e) => e.key === "Enter" && pick(b.role)}
              >
                <Card
                  hover
                  className={cn("p-6 text-center transition-all hover:border-primary/30")}
                >
                  <div className="text-3xl">{b.icon}</div>
                  <div className="mt-3 font-semibold text-foreground">{b.ar}</div>
                  <div className="mt-1 text-xs text-muted">{b.en}</div>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        <Button variant="ghost" className="mt-6 w-full" onClick={() => router.push("/login")}>
          رجوع
        </Button>
      </motion.div>
    </div>
  );
}
