"use client";

import { motion } from "framer-motion";
import { DantalPage } from "@/components/layout/DantalPage";
import { DantalSettingsSection } from "@/components/settings/DantalSettingsSection";
import { CloudSyncSection } from "@/components/settings/CloudSyncSection";
import { ClinicTeamSection } from "@/components/settings/ClinicTeamSection";
import { Button, Input, Select } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { useUiPrefsStore } from "@/stores/useUiPrefsStore";
import { useRouter } from "next/navigation";
import { Cloud } from "@/lib/cloud";
import { TIER_LABELS } from "@/lib/constants";
import { slideUp } from "@/lib/motion";
import { Moon, Sun, LogOut } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const logout = useSessionStore((s) => s.logout);
  const db = useDbStore((s) => s.db);
  const updateMeta = useDbStore((s) => s.updateMeta);
  const theme = useUiPrefsStore((s) => s.theme);
  const setTheme = useUiPrefsStore((s) => s.setTheme);
  const isOwner = user?.role === "owner";
  const m = db.meta;

  function saveClinic() {
    updateMeta({
      clinicName: (document.getElementById("st-clinic-name") as HTMLInputElement)?.value || m.clinicName,
      clinicNameEn: (document.getElementById("st-clinic-name-en") as HTMLInputElement)?.value || m.clinicNameEn,
      doctorName: (document.getElementById("st-doctor-name") as HTMLInputElement)?.value || m.doctorName,
      clinicPhone: (document.getElementById("st-clinic-phone") as HTMLInputElement)?.value || m.clinicPhone,
      clinicAddress: (document.getElementById("st-clinic-address") as HTMLInputElement)?.value || m.clinicAddress,
    });
    alert("تم الحفظ");
  }

  function savePins() {
    const owner = (document.getElementById("st-pin-owner") as HTMLInputElement)?.value;
    const reception = (document.getElementById("st-pin-reception") as HTMLInputElement)?.value;
    const secretary = (document.getElementById("st-pin-secretary") as HTMLInputElement)?.value;
    updateMeta({
      ownerPin: owner || m.ownerPin,
      receptionPin: reception || m.receptionPin,
      secretaryPin: secretary || m.secretaryPin,
      pins: { owner, reception, secretary },
    });
    alert("تم حفظ الرموز");
  }

  function savePortal() {
    updateMeta({
      portal: {
        ...m.portal,
        doctorWa: (document.getElementById("st-portal-doc-wa") as HTMLInputElement)?.value || m.portal.doctorWa,
        clinicWa: (document.getElementById("st-portal-clinic-wa") as HTMLInputElement)?.value || m.portal.clinicWa,
        hours: (document.getElementById("st-portal-hours") as HTMLInputElement)?.value || m.portal.hours,
        mapsUrl: (document.getElementById("st-portal-maps") as HTMLInputElement)?.value || m.portal.mapsUrl,
      },
    });
    alert("تم الحفظ");
  }

  function saveAi() {
    updateMeta({
      ai: {
        ...m.ai,
        enabled: (document.getElementById("st-ai-enabled") as HTMLInputElement)?.checked || false,
        provider: (document.getElementById("st-ai-provider") as HTMLSelectElement)?.value || m.ai.provider,
        apiKey: (document.getElementById("st-ai-key") as HTMLInputElement)?.value || m.ai.apiKey,
        model: (document.getElementById("st-ai-model") as HTMLInputElement)?.value || m.ai.model,
      },
    });
    alert("تم الحفظ");
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function doLogout() {
    if (Cloud.loggedIn()) Cloud.logout();
    logout();
    router.replace("/login");
  }

  return (
    <DantalPage title="الإعدادات">
      <motion.div className="mb-8" {...slideUp}>
        <h1 className="dantal-title">الإعدادات</h1>
        <p className="dantal-subtitle mt-2">إعدادات العيادة، الأمان، والمزامنة</p>
      </motion.div>

      <DantalSettingsSection title="معلومات العيادة">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="st-clinic-name" label="اسم العيادة" defaultValue={m.clinicName} />
          <Input id="st-clinic-name-en" label="اسم العيادة (EN)" defaultValue={m.clinicNameEn} />
          <Input id="st-doctor-name" label="اسم الطبيب" defaultValue={m.doctorName || ""} />
          <Input id="st-clinic-phone" label="الهاتف" defaultValue={m.clinicPhone} />
          <Input id="st-clinic-address" label="العنوان" defaultValue={m.clinicAddress} className="sm:col-span-2" />
        </div>
        <Button onClick={saveClinic}>حفظ</Button>
      </DantalSettingsSection>

      <DantalSettingsSection title="المظهر">
        <Button variant="secondary" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
        </Button>
      </DantalSettingsSection>

      {isOwner && (
        <DantalSettingsSection title="حسابات الموظفين">
          <ClinicTeamSection />
        </DantalSettingsSection>
      )}

      {isOwner && (
        <>
          <DantalSettingsSection title="الأمان — رموز PIN (اختياري)">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input id="st-pin-owner" label="رمز المالك" type="password" defaultValue={m.pins?.owner || m.ownerPin} />
              <Input id="st-pin-reception" label="رمز الاستقبال" type="password" defaultValue={m.pins?.reception || m.receptionPin} />
              <Input id="st-pin-secretary" label="رمز السكرتير" type="password" defaultValue={m.pins?.secretary || m.secretaryPin} />
            </div>
            <Button onClick={savePins}>حفظ الرموز</Button>
          </DantalSettingsSection>

          <DantalSettingsSection title="بوابة المريض">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="st-portal-doc-wa" label="واتساب الطبيب" defaultValue={m.portal.doctorWa} />
              <Input id="st-portal-clinic-wa" label="واتساب العيادة" defaultValue={m.portal.clinicWa} />
              <Input id="st-portal-hours" label="ساعات العمل" defaultValue={m.portal.hours} />
              <Input id="st-portal-maps" label="رابط الخريطة" defaultValue={m.portal.mapsUrl} />
            </div>
            <Button onClick={savePortal}>حفظ</Button>
          </DantalSettingsSection>

          <DantalSettingsSection title="مساعد AI للأشعة">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-foreground-secondary">
                <input type="checkbox" id="st-ai-enabled" defaultChecked={m.ai.enabled} className="h-4 w-4 accent-primary" />
                تفعيل المساعد
              </label>
              <div>
                <label htmlFor="st-ai-provider" className="mb-2 block text-sm font-medium text-foreground-secondary">المزود</label>
                <Select id="st-ai-provider" defaultValue={m.ai.provider}>
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                </Select>
              </div>
              <Input id="st-ai-key" label="مفتاح API" type="password" defaultValue={m.ai.apiKey} />
              <Input id="st-ai-model" label="النموذج" defaultValue={m.ai.model} />
            </div>
            <Button onClick={saveAi}>حفظ</Button>
          </DantalSettingsSection>

          <DantalSettingsSection title="الترخيص">
            <p className="text-sm text-muted">
              الخطة: <span className="font-medium text-foreground">{TIER_LABELS[m.license.tier]?.ar || m.license.tier}</span>
              {m.license.key ? ` — ${m.license.key}` : " — غير مفعّل"}
            </p>
            <p className="text-sm text-muted">يمكن تفعيل الترخيص عبر Cloud Sync أدناه.</p>
          </DantalSettingsSection>

          <DantalSettingsSection title="Cloud Sync">
            <CloudSyncSection />
          </DantalSettingsSection>
        </>
      )}

      <DantalSettingsSection title="الخصوصية والأمان">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-border-subtle bg-border-subtle/40 px-4 py-3">
          <span className="text-sm text-foreground-secondary">القفل التلقائي (دقائق، 0 = إيقاف)</span>
          <Input
            type="number"
            min={0}
            max={120}
            className="w-24"
            defaultValue={String(m.idleLockMin ?? 5)}
            onChange={(e) => updateMeta({ idleLockMin: Math.max(0, Number(e.target.value) || 0) })}
          />
        </div>
      </DantalSettingsSection>

      <DantalSettingsSection title="تسجيل الخروج" danger>
        <Button variant="danger" onClick={doLogout}>
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </DantalSettingsSection>
    </DantalPage>
  );
}
