"use client";

import { useState } from "react";
import { Cloud } from "@/lib/cloud";
import { useDbStore } from "@/stores/useDbStore";
import type { CloudSyncConfig } from "@/types/db";
import { STORAGE_KEY } from "@/types/db";

export function CloudSyncSection() {
  const db = useDbStore((s) => s.db);
  const updateMeta = useDbStore((s) => s.updateMeta);
  const replaceDb = useDbStore((s) => s.replaceDb);
  const m = db.meta;

  const [apiUrl, setApiUrl] = useState(m.cloud.apiUrl || "");
  const [email, setEmail] = useState(m.cloud.email || "");
  const [passphrase, setPassphrase] = useState(m.cloud.passphrase || "");
  const [password, setPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const online = Cloud.configured();
  const authed = Cloud.loggedIn();

  function saveConfig() {
    const cloud: CloudSyncConfig = { ...m.cloud, apiUrl: apiUrl.trim(), email: email.trim(), passphrase };
    updateMeta({ cloud });
    setStatus("تم حفظ الإعدادات");
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setStatus("");
    try {
      await action();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "فشل الاتصال";
      setStatus("❌ " + msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-section">
      <div className="settings-title">Cloud Sync — المزامنة السحابية</div>
      <p className="muted">
        {online ? (authed ? "✓ متصل" : "⚠ API مضبوط — سجّل الدخول") : "أدخل رابط API للتفعيل"}
      </p>

      <div className="form-grid">
        <div className="field"><label>API URL</label>
          <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://api.example.com" />
        </div>
        <div className="field"><label>البريد</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field"><label>كلمة مرور الحساب</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="field"><label>عبارة التشفير (Passphrase)</label>
          <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="لتشفير البيانات" />
        </div>
      </div>

      <div className="row gap mt-2">
        <button className="btn btn-primary" disabled={busy} onClick={() => saveConfig()}>حفظ الإعدادات</button>
        <button className="btn" disabled={busy} onClick={() => run(async () => {
          saveConfig();
          await Cloud.register(m.clinicName || "Clinic", email, password);
          setStatus("✓ تم إنشاء الحساب وتسجيل الدخول");
        })}>إنشاء حساب</button>
        <button className="btn" disabled={busy} onClick={() => run(async () => {
          saveConfig();
          await Cloud.login(email, password);
          setStatus("✓ تم تسجيل الدخول");
        })}>دخول</button>
        {authed && (
          <button className="btn btn-ghost" disabled={busy} onClick={() => { Cloud.logout(); setStatus("تم الخروج"); }}>خروج</button>
        )}
      </div>

      {authed && (
        <>
          <div className="form-grid mt-3">
            <div className="field"><label>مفتاح الترخيص</label>
              <input value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
            </div>
          </div>
          <div className="row gap mt-2">
            <button className="btn" disabled={busy} onClick={() => run(async () => {
              const res = await Cloud.activateLicense(licenseKey);
              updateMeta({ license: { ...m.license, key: licenseKey, activatedAt: Date.now() } });
              setStatus("✓ " + (res.message || "تم تفعيل الترخيص"));
            })}>تفعيل الترخيص</button>
            <button className="btn btn-primary" disabled={busy} onClick={() => run(async () => {
              const pass = passphrase || prompt("عبارة التشفير:") || "";
              if (!pass) return;
              const res = await Cloud.syncNow(pass);
              if (res.conflict) {
                if (confirm("تعارض — هل تريد فرض الرفع؟")) {
                  /* force push would need ?force=true - simplified */
                  setStatus("⚠ تعارض — راجع البيانات يدوياً");
                }
              } else {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) replaceDb(JSON.parse(raw));
                updateMeta({ cloud: { ...m.cloud, lastSync: Date.now() } as CloudSyncConfig & { lastSync?: number } });
                setStatus("✓ تمت المزامنة");
              }
            })}>مزامنة الآن</button>
            <button className="btn" disabled={busy} onClick={() => run(async () => {
              const pass = passphrase || prompt("عبارة التشفير:") || "";
              if (!pass) return;
              await Cloud.backupNow(pass);
              updateMeta({ lastBackup: Date.now() });
              setStatus("✓ تم رفع النسخة السحابية");
            })}>نسخة سحابية</button>
          </div>
          <label className="qf-checkbox-row mt-2">
            <input type="checkbox" checked={m.cloud.autoSync} onChange={(e) => updateMeta({ cloud: { ...m.cloud, autoSync: e.target.checked } })} />
            <span>مزامنة تلقائية كل 5 دقائق (عند فتح التطبيق)</span>
          </label>
        </>
      )}

      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
