"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Plus, UserPlus } from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ds";
import { apiErrorMessage, isBackendAuthed } from "@/lib/backend";
import { ClinicTeamApi } from "@/lib/clinic-team-api";
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  type PlatformUser,
  type PlatformUserRole,
} from "@/lib/platform-api";

const STAFF_ROLES: PlatformUserRole[] = ASSIGNABLE_ROLES.filter((r) => r !== "ADMIN");

function userRole(user: PlatformUser): PlatformUserRole {
  const roles = user.roles;
  if (Array.isArray(roles) && roles.length) return roles[0];
  return "RECEPTIONIST";
}

export function ClinicTeamSection() {
  const backendReady = isBackendAuthed();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const [createdPassword, setCreatedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PlatformUserRole>("RECEPTIONIST");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const load = useCallback(async () => {
    if (!backendReady) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setUsers(await ClinicTeamApi.list());
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [backendReady]);

  useEffect(() => {
    load();
  }, [load]);

  if (!backendReady) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        جلسة الدخول انتهت أو غير مفعّلة. من الأسفل اضغط <strong>تسجيل الخروج</strong> ثم ادخل من جديد
        بالبريد وكلمة مرور مدير العيادة — بعدها يظهر زر إضافة الموظفين.
      </div>
    );
  }

  function openAdd() {
    setEmail("");
    setPassword("");
    setRole("RECEPTIONIST");
    setFirstName("");
    setLastName("");
    setError("");
    setModalOpen(true);
  }

  async function createMember() {
    if (!email.trim() || password.length < 8) {
      setError("أدخل البريد وكلمة مرور (8 أحرف على الأقل)");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await ClinicTeamApi.create({
        email: email.trim(),
        password,
        role,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setCreatedEmail(email.trim());
      setCreatedPassword(password);
      setModalOpen(false);
      setSuccessOpen(true);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function copyCredentials() {
    const text = [`البريد: ${createdEmail}`, `كلمة المرور: ${createdPassword}`, "", "صفحة الدخول: /login"].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        أضف حسابات دخول للموظفين (استقبال، طبيب، ...). كل موظف يسجّل دخوله من صفحة الدخول بالبريد وكلمة
        المرور فقط — بدون PIN.
      </p>

      {error && !modalOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex justify-end">
        <Button onClick={openAdd}>
          <UserPlus className="h-4 w-4" />
          إضافة موظف
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">جاري التحميل...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted">لا يوجد موظفون بعد.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الصلاحية</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="primary">{ROLE_LABELS[userRole(user)]}</Badge>
                </TableCell>
                <TableCell>
                  {user.active ? <Badge variant="success">نشط</Badge> : <Badge variant="danger">موقوف</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="إضافة موظف">
        <ModalBody>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم الأول" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="اسم العائلة" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Input
              label="البريد الإلكتروني *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sm:col-span-2"
            />
            <Input
              label="كلمة المرور *"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 أحرف على الأقل"
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">الصلاحية *</label>
              <Select value={role} onChange={(e) => setRole(e.target.value as PlatformUserRole)}>
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          <Button disabled={busy} onClick={createMember}>
            <Plus className="h-4 w-4" />
            إنشاء الحساب
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="تم إنشاء الحساب">
        <ModalBody>
          <div className="space-y-3 rounded-xl border border-[#d1dde3] bg-[#f8fafb] p-4 text-sm">
            <p>
              <span className="font-semibold">البريد:</span> {createdEmail}
            </p>
            <p>
              <span className="font-semibold">كلمة المرور:</span> {createdPassword}
            </p>
            <p className="text-muted">أرسل هذه البيانات للموظف — يدخل من صفحة الدخول مباشرة.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={copyCredentials}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "تم النسخ" : "نسخ البيانات"}
          </Button>
          <Button onClick={() => setSuccessOpen(false)}>تم</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
