"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, Copy, Plus, Power, RefreshCw, Settings2 } from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ds";
import { apiErrorMessage } from "@/lib/backend";
import { PlatformApi, type CreateClinicResult, type PlatformClinic } from "@/lib/platform-api";
import { slideUp } from "@/lib/motion";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PlatformClinicsPage() {
  const [clinics, setClinics] = useState<PlatformClinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [created, setCreated] = useState<CreateClinicResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [clinicName, setClinicName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setClinics(await PlatformApi.listClinics());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setClinicName("");
    setManagerEmail("");
    setManagerPassword("");
    setLicenseKey("");
    setError("");
    setModalOpen(true);
  }

  async function createClinic() {
    if (!clinicName.trim() || !managerEmail.trim() || managerPassword.length < 8) {
      setError("أدخل اسم العيادة والبريد وكلمة مرور (8 أحرف على الأقل)");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await PlatformApi.createClinic({
        clinicName: clinicName.trim(),
        managerEmail: managerEmail.trim(),
        managerPassword,
        licenseKey: licenseKey.trim() || undefined,
      });
      setCreated(result);
      setModalOpen(false);
      setSuccessOpen(true);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(clinic: PlatformClinic) {
    setBusy(true);
    setError("");
    try {
      await PlatformApi.setClinicActive(clinic.id, !clinic.active);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function copyCredentials() {
    if (!created) return;
    const text = [
      `اسم العيادة: ${created.clinic.name}`,
      `البريد: ${created.managerEmail}`,
      `كلمة المرور: ${created.managerPassword}`,
      created.licenseActivated ? `الترخيص: مفعّل (${created.clinic.licenseTier})` : "الترخيص: غير مفعّل",
      "",
      "بعد تسجيل الدخول يختار المدير دور «مالك» ويضيف باقي الكادر من صفحة الكادر.",
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <motion.div {...slideUp}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">إدارة العيادات</h1>
          <p className="mt-1 text-sm text-[#6b7c85]">
            أنشئ عيادات جديدة وادخل لكل عيادة لإدارة المديرين والصلاحيات.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={loading || busy} onClick={() => load()}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button disabled={busy} onClick={openCreate}>
            <Plus className="h-4 w-4" />
            عيادة جديدة
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#d1dde3] bg-white p-10 text-center text-[#6b7c85]">
          جاري التحميل...
        </div>
      ) : clinics.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="لا توجد عيادات بعد"
          description="أنشئ أول عيادة وشارك بيانات المدير معه."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              إضافة عيادة
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#d1dde3] bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العيادة</TableHead>
                <TableHead>مدير العيادة</TableHead>
                <TableHead>الترخيص</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((clinic) => (
                <TableRow key={clinic.id}>
                  <TableCell>
                    <div className="font-medium text-[#1f2937]">{clinic.name}</div>
                    <div className="text-xs text-[#9ca3af]">{clinic.slug}</div>
                  </TableCell>
                  <TableCell>{clinic.managerEmail || "—"}</TableCell>
                  <TableCell>
                    {clinic.licenseActivated ? (
                      <Badge variant="success">{clinic.licenseTier || "مفعّل"}</Badge>
                    ) : (
                      <Badge variant="warning">غير مفعّل</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(clinic.createdAt)}</TableCell>
                  <TableCell>
                    {clinic.active ? (
                      <Badge variant="success">نشطة</Badge>
                    ) : (
                      <Badge variant="danger">موقوفة</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/platform/clinics/${clinic.id}`}>
                        <Button variant="soft" size="sm">
                          <Settings2 className="h-4 w-4" />
                          إدارة
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => toggleActive(clinic)}
                      >
                        <Power className="h-4 w-4" />
                        {clinic.active ? "إيقاف" : "تفعيل"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إنشاء عيادة جديدة">
        <ModalBody>
          <p className="mb-4 text-sm text-[#6b7c85]">
            سيتم إنشاء حساب مدير (ADMIN) للعيادة. يمكنك لاحقاً إضافة مستخدمين وصلاحيات من صفحة إدارة العيادة.
          </p>
          {error && modalOpen && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">اسم العيادة *</label>
              <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="عيادة النور" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">بريد المدير *</label>
              <Input
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="owner@clinic.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">كلمة مرور المدير *</label>
              <Input
                type="text"
                value={managerPassword}
                onChange={(e) => setManagerPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">مفتاح الترخيص (اختياري)</label>
              <Input
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="اتركه فارغاً أو DANTAL-DEV-CLINIC"
              />
              <p className="mt-1 text-xs text-[#9ca3af]">
                إذا ظهر خطأ في الترخيص، اترك الحقل فارغاً وأعد المحاولة.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          <Button disabled={busy} onClick={createClinic}>
            إنشاء العيادة
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="تم إنشاء العيادة">
        <ModalBody>
          {created && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#eaf8f0] px-4 py-3 text-sm text-[#166534]">
                تم إنشاء العيادة بنجاح. انسخ البيانات وأرسلها لمدير العيادة.
              </div>
              <div className="space-y-2 rounded-xl border border-[#d1dde3] bg-[#f8fafb] p-4 text-sm">
                <p>
                  <span className="font-semibold">اسم العيادة:</span> {created.clinic.name}
                </p>
                <p>
                  <span className="font-semibold">البريد:</span> {created.managerEmail}
                </p>
                <p>
                  <span className="font-semibold">كلمة المرور:</span> {created.managerPassword}
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={copyCredentials}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "تم النسخ" : "نسخ البيانات"}
          </Button>
          {created && (
            <Link href={`/platform/clinics/${created.clinic.id}`}>
              <Button onClick={() => setSuccessOpen(false)}>إدارة العيادة</Button>
            </Link>
          )}
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}
