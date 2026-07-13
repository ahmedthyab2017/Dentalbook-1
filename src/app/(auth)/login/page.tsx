"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDbStore } from "@/stores/useDbStore";
import { validateEmailLogin } from "@/lib/auth";
import { fadeScaleIn } from "@/lib/motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Cloud } from "@/lib/cloud";
import { apiErrorMessage, isBackendEnabled, mergeExportedDb, pullFromBackend, pushToBackend } from "@/lib/backend";
import { APP_BRAND } from "@/lib/constants";
import type { CloudSyncConfig } from "@/types/db";

const TEAL = "#366F7F";

const PLATFORM_DENIED_MSG = "لوحة المنصة لمدير النظام فقط. سجّل دخولك بحساب مدير المنصة.";

export default function LoginPage() {
  const router = useRouter();
  const updateMeta = useDbStore((s) => s.updateMeta);
  const replaceDb = useDbStore((s) => s.replaceDb);
  const ensureSeeded = useDbStore((s) => s.ensureSeeded);
  const backendMode = isBackendEnabled();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "platform") {
      setError(PLATFORM_DENIED_MSG);
    }
  }, []);

  async function finishBackendAuth(cloud: CloudSyncConfig) {
    let merged;
    try {
      const exported = await pullFromBackend(cloud);
      merged = exported || mergeExportedDb({}, cloud);
    } catch {
      merged = mergeExportedDb({}, cloud);
    }
    replaceDb(merged);
    if (!merged.patients.length && !merged.meta.demoSeeded) {
      ensureSeeded();
    }
    try {
      await pushToBackend(useDbStore.getState().db);
    } catch {
      /* first-time sync may fail; login should still succeed */
    }
    router.push("/role");
  }

  async function submit() {
    setError("");
    if (!email || !password) {
      setError("الرجاء تعبئة كل الحقول");
      return;
    }
    setLoading(true);
    try {
      if (backendMode) {
        const prev = useDbStore.getState().db.meta.cloud;
        const cloud: CloudSyncConfig = {
          ...prev,
          apiUrl: Cloud.base(),
          email: email.trim(),
          passphrase: prev.passphrase ?? "",
          autoSync: prev.autoSync ?? false,
        };
        updateMeta({ cloud });
        await Cloud.login(email.trim(), password);
        const profile = await Cloud.me();
        if (Cloud.isSuperAdmin(profile.roles)) {
          router.push("/platform/clinics");
          return;
        }
        await finishBackendAuth(cloud);
        return;
      }

      if (!validateEmailLogin(email, password)) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
        return;
      }
      router.push("/role");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#dceef0] px-4 py-10 sm:px-6">
      <motion.div
        className="grid w-full max-w-[980px] overflow-hidden rounded-[32px] bg-white shadow-[0_24px_60px_-20px_rgba(54,111,127,0.25)] lg:min-h-[560px] lg:grid-cols-2"
        {...fadeScaleIn}
      >
        <div className="flex flex-col justify-between px-5 py-8 sm:px-12 sm:py-14 lg:px-14">
          <div>
            <h1
              className="text-[2rem] font-bold leading-tight sm:text-[2.25rem]"
              style={{ color: TEAL }}
            >
              تسجيل الدخول
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#6b7c85]">
              مرحباً بك في{" "}
              <span className="font-semibold text-[#374151]">{APP_BRAND}</span>. سجّل الدخول
              لإدارة مواعيدك ومتابعة عيادتك.
            </p>

            <div className="mt-9 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  {backendMode ? "البريد الإلكتروني" : "اسم المستخدم"}
                  <span className="text-[#366F7F]">*</span>
                  {!backendMode && (
                    <span className="ms-1 font-normal text-[#9ca3af]">· admin</span>
                  )}
                </label>
                <input
                  type={backendMode ? "email" : "text"}
                  autoComplete="username"
                  placeholder={backendMode ? "owner@clinic.com" : "أدخل اسم المستخدم"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className={cn(
                    "h-[52px] w-full rounded-full border bg-white px-5 text-sm text-[#374151] outline-none transition-colors",
                    "placeholder:text-[#b0bec5] focus:border-[#366F7F] focus:ring-2 focus:ring-[#366F7F]/15",
                    error ? "border-red-400" : "border-[#d1dde3]"
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  كلمة المرور<span className="text-[#366F7F]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="8 أحرف على الأقل"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className={cn(
                      "h-[52px] w-full rounded-full border bg-white px-5 pe-12 text-sm text-[#374151] outline-none transition-colors",
                      "placeholder:text-[#b0bec5] focus:border-[#366F7F] focus:ring-2 focus:ring-[#366F7F]/15",
                      error ? "border-red-400" : "border-[#d1dde3]"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#366F7F]"
                    aria-label={showPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={submit}
                className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: TEAL }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </div>
          </div>

          <p className="mt-10 text-xs text-[#9ca3af]">
            ©{new Date().getFullYear()} {APP_BRAND}. جميع الحقوق محفوظة.
          </p>
        </div>

        <div
          className="relative hidden min-h-[280px] bg-cover bg-center lg:block lg:min-h-0"
          style={{ backgroundImage: "url('/assets/login-hero.jpg')" }}
          role="img"
          aria-label="عيادة أسنان حديثة"
        />
      </motion.div>
    </div>
  );
}
