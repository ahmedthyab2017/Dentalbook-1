"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { attemptRoleLogin, roleNeedsName } from "@/lib/auth";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { Button, Input, Card, CardBody } from "@/components/ds";
import { fadeScaleIn } from "@/lib/motion";
import { Lock } from "lucide-react";

export default function PinPage() {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const addPatientRaw = useDbStore((s) => s.db.patients);
  const replaceDb = useDbStore((s) => s.replaceDb);
  const selectedRole = useSessionStore((s) => s.selectedRole);
  const setUser = useSessionStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedRole) router.replace("/login");
  }, [selectedRole, router]);

  if (!selectedRole) return null;

  function submit() {
    setError("");
    const result = attemptRoleLogin(db, selectedRole!, { name, pin });
    if (!result.ok) {
      setError(result.error || "خطأ غير معروف");
      return;
    }
    if (result.newPatient) {
      replaceDb({ ...db, patients: [...addPatientRaw, result.newPatient] });
    }
    setUser(result.user!);
    router.push(result.user!.role === "patient" ? "/myfile" : "/dashboard");
  }

  const needsName = roleNeedsName(selectedRole);

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-6 py-12">
      <motion.div className="w-full max-w-md" {...fadeScaleIn}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] bg-primary text-white shadow-[var(--shadow-soft)]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">الرمز السري</h1>
          <p className="mt-2 text-sm text-muted">أدخل رمز الدخول للمتابعة</p>
        </div>

        <Card className="shadow-[var(--shadow-soft-lg)]">
          <CardBody className="space-y-5">
            {needsName && (
              <Input
                label="الاسم"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              label="الرمز السري الخاص"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              error={error || undefined}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <Button className="w-full" onClick={submit}>
              دخول
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                useSessionStore.getState().setSelectedRole(null);
                router.push("/role");
              }}
            >
              رجوع
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
