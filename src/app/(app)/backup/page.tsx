"use client";

import { useRef, useState } from "react";
import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import { useDbStore } from "@/stores/useDbStore";
import { Cloud } from "@/lib/cloud";
import { STORAGE_KEY } from "@/types/db";
import { fmtDateShort } from "@/lib/format";

export default function BackupPage() {
  return (
    <DantalPage title="النسخ الاحتياطي">
        <OwnerOnly>
          <BackupContent />
        </OwnerOnly>
      </DantalPage>
  );
}

function BackupContent() {
  const db = useDbStore((s) => s.db);
  const replaceDb = useDbStore((s) => s.replaceDb);
  const updateMeta = useDbStore((s) => s.updateMeta);
  const fileRef = useRef<HTMLInputElement>(null);
  const [encryptPass, setEncryptPass] = useState("");
  const [busy, setBusy] = useState(false);

  const stats = [
    { label: "المرضى", count: db.patients.length },
    { label: "المواعيد", count: db.appointments.length },
    { label: "الخطط", count: db.plans.length },
    { label: "المدفوعات", count: db.payments.length },
    { label: "المصاريف", count: db.expenses.length },
    { label: "الوصفات", count: db.prescriptions.length },
  ];

  const [now] = useState(() => Date.now());

  const lastBackup = db.meta.lastBackup;
  const overdue = !lastBackup || now - lastBackup > 7 * 86400000;

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mukhtasar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateMeta({ lastBackup: Date.now() });
  }

  async function downloadEncrypted() {
    const pass = encryptPass.trim() || prompt("كلمة مرور التشفير:")?.trim();
    if (!pass) return;
    setBusy(true);
    try {
      const env = await Cloud.encrypt(pass);
      const blob = new Blob([JSON.stringify({ ...env, exportedAt: Date.now() })], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mukhtasar-encrypted-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      updateMeta({ lastBackup: Date.now() });
    } catch {
      alert("فشل التشفير");
    } finally {
      setBusy(false);
    }
  }

  async function restoreEncrypted(file: File) {
    const pass = prompt("كلمة مرور فك التشفير:")?.trim();
    if (!pass) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const env = JSON.parse(String(reader.result));
        const json = await Cloud.decrypt(env, pass);
        const parsed = JSON.parse(json);
        if (!parsed.patients) {
          alert("ملف غير صالح");
          return;
        }
        if (!confirm("استعادة النسخة المشفّرة؟")) return;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY + "_prev", JSON.stringify(db));
        }
        replaceDb(parsed);
        alert("تمت الاستعادة بنجاح");
      } catch {
        alert("كلمة مرور خاطئة أو ملف تالف");
      }
    };
    reader.readAsText(file);
  }

  function restoreBackup(file: File) {
    if (file.name.includes("encrypted")) {
      restoreEncrypted(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.patients || !parsed.appointments) {
          alert("ملف غير صالح");
          return;
        }
        if (!confirm("استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.")) return;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY + "_prev", JSON.stringify(db));
        }
        replaceDb(parsed);
        alert("تمت الاستعادة بنجاح");
      } catch {
        alert("خطأ في قراءة الملف");
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm("حذف كل البيانات وإعادة التحميل؟")) return;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">النسخ الاحتياطي</h1>
      </div>

      <div className="stats-grid" id="bk-stats">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.count}</div>
          </div>
        ))}
      </div>

      <div id="bk-health" className="mt-3">
        {overdue && (
          <div className="dash-notice mb-3">
            <div className="dash-notice-body">
              <div className="dash-notice-title">⚠️ لم يتم أخذ نسخة احتياطية منذ أكثر من 7 أيام</div>
            </div>
          </div>
        )}
        {lastBackup && (
          <p className="muted">آخر نسخة: {fmtDateShort(new Date(lastBackup).toISOString().slice(0, 10))}</p>
        )}
      </div>

      <div className="row gap mt-3">
        <button className="btn btn-primary" onClick={downloadBackup}>
          ⬇️ تحميل JSON
        </button>
        <button className="btn btn-primary" disabled={busy} onClick={downloadEncrypted}>
          🔐 تحميل مشفّر
        </button>
        <input
          type="password"
          className="field-input"
          placeholder="كلمة مرور التشفير (اختياري)"
          value={encryptPass}
          onChange={(e) => setEncryptPass(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <button className="btn" onClick={() => fileRef.current?.click()}>
          ⬆️ استعادة من ملف
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) restoreBackup(f);
            e.target.value = "";
          }}
        />
        <button className="btn btn-danger" onClick={resetAll}>
          🗑️ إعادة ضبط
        </button>
      </div>
    </>
  );
}
