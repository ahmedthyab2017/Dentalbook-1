"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  KeyRound,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
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
import { apiErrorMessage } from "@/lib/backend";
import {
  ASSIGNABLE_ROLES,
  PlatformApi,
  ROLE_LABELS,
  type PlatformClinicDetail,
  type PlatformUser,
  type PlatformUserRole,
} from "@/lib/platform-api";
import { slideUp } from "@/lib/motion";

function userRole(user: PlatformUser): PlatformUserRole {
  return user.roles[0] || "ADMIN";
}

function roleLabel(user: PlatformUser) {
  const role = userRole(user);
  return ROLE_LABELS[role] || role;
}

export default function PlatformClinicDetailPage() {
  const params = useParams();
  const clinicId = String(params.id);

  const [detail, setDetail] = useState<PlatformClinicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<PlatformUser | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PlatformUserRole>("DOCTOR");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDetail(await PlatformApi.getClinic(clinicId));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEmail("");
    setPassword("");
    setRole("DOCTOR");
    setFirstName("");
    setLastName("");
    setPhone("");
    setAddOpen(true);
  }

  function openEdit(user: PlatformUser) {
    setEditing(user);
    setEmail(user.email);
    setPassword("");
    setRole(userRole(user));
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhone(user.phone || "");
    setEditOpen(true);
  }

  async function createUser() {
    if (!email.trim() || password.length < 8) {
      setError("أدخل البريد وكلمة مرور (8 أحرف على الأقل)");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await PlatformApi.createUser(clinicId, {
        email: email.trim(),
        password,
        role,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setAddOpen(false);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      await PlatformApi.updateUser(clinicId, editing.id, {
        role,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        ...(password.length >= 8 ? { password } : {}),
      });
      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleUser(user: PlatformUser) {
    setBusy(true);
    setError("");
    try {
      await PlatformApi.updateUser(clinicId, user.id, { active: !user.active });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(user: PlatformUser) {
    if (!confirm(`حذف المستخدم ${user.email}؟`)) return;
    setBusy(true);
    setError("");
    try {
      await PlatformApi.deleteUser(clinicId, user.id);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-[#d1dde3] bg-white p-10 text-center text-[#6b7c85]">جاري التحميل...</div>;
  }

  if (!detail) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error || "تعذر تحميل بيانات العيادة"}
      </div>
    );
  }

  const clinic = detail.clinic;

  return (
    <motion.div {...slideUp}>
      <Link
        href="/platform/clinics"
        className="mb-4 inline-flex items-center gap-2 text-sm text-[#366F7F] hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للعيادات
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">{clinic.name}</h1>
          <p className="mt-1 text-sm text-[#6b7c85]">{clinic.slug}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {clinic.active ? <Badge variant="success">نشطة</Badge> : <Badge variant="danger">موقوفة</Badge>}
            {clinic.licenseActivated ? (
              <Badge variant="success">ترخيص: {clinic.licenseTier}</Badge>
            ) : (
              <Badge variant="warning">بدون ترخيص</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={busy} onClick={() => load()}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button disabled={busy} onClick={openAdd}>
            <UserPlus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#d1dde3] bg-white shadow-sm">
        <div className="border-b border-[#d1dde3] px-5 py-4">
          <h2 className="font-semibold text-[#1f2937]">المستخدمون والصلاحيات</h2>
          <p className="mt-1 text-xs text-[#6b7c85]">
            إدارة مدير العيادة والأطباء والاستقبال — كل مستخدم له بريد وكلمة مرور وصلاحية على الـ API.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الصلاحية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">
                    {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                  </div>
                  {user.phone && <div className="text-xs text-[#9ca3af]">{user.phone}</div>}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="primary">{roleLabel(user)}</Badge>
                </TableCell>
                <TableCell>
                  {user.active ? <Badge variant="success">نشط</Badge> : <Badge variant="danger">موقوف</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => openEdit(user)}>
                      <Pencil className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => toggleUser(user)}>
                      <Power className="h-4 w-4" />
                      {user.active ? "إيقاف" : "تفعيل"}
                    </Button>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => removeUser(user)}>
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormModal
        open={addOpen}
        title="إضافة مستخدم جديد"
        email={email}
        password={password}
        role={role}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        requirePassword
        busy={busy}
        onClose={() => setAddOpen(false)}
        onSubmit={createUser}
        setEmail={setEmail}
        setPassword={setPassword}
        setRole={setRole}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setPhone={setPhone}
      />

      <UserFormModal
        open={editOpen}
        title="تعديل المستخدم والصلاحية"
        email={email}
        password={password}
        role={role}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        emailReadonly
        busy={busy}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSubmit={saveEdit}
        setEmail={setEmail}
        setPassword={setPassword}
        setRole={setRole}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setPhone={setPhone}
      />
    </motion.div>
  );
}

function UserFormModal({
  open,
  title,
  email,
  password,
  role,
  firstName,
  lastName,
  phone,
  requirePassword,
  emailReadonly,
  busy,
  onClose,
  onSubmit,
  setEmail,
  setPassword,
  setRole,
  setFirstName,
  setLastName,
  setPhone,
}: {
  open: boolean;
  title: string;
  email: string;
  password: string;
  role: PlatformUserRole;
  firstName: string;
  lastName: string;
  phone: string;
  requirePassword?: boolean;
  emailReadonly?: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setRole: (v: PlatformUserRole) => void;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setPhone: (v: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <ModalBody>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">الاسم الأول</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">اسم العائلة</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">البريد الإلكتروني *</label>
            <Input
              type="email"
              value={email}
              readOnly={emailReadonly}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@clinic.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              {requirePassword ? "كلمة المرور *" : "كلمة مرور جديدة (اختياري)"}
            </label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={requirePassword ? "8 أحرف على الأقل" : "اتركه فارغاً بدون تغيير"}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">الصلاحية *</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as PlatformUserRole)}>
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">الهاتف</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          إلغاء
        </Button>
        <Button disabled={busy} onClick={onSubmit}>
          {requirePassword ? <Plus className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
          {requirePassword ? "إضافة" : "حفظ"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
