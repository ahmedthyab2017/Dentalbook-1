"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import { ClinicTeamSection } from "@/components/settings/ClinicTeamSection";
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
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
import { useDbStore } from "@/stores/useDbStore";
import { isBackendAuthed } from "@/lib/backend";
import type { StaffMember, StaffRole } from "@/types/db";
import { slideUp } from "@/lib/motion";

const ROLE_LABEL: Record<StaffRole, string> = {
  doctor: "طبيب",
  reception: "استقبال",
  assistant: "مساعد",
  owner: "مالك",
};

const ROLE_OPTIONS = [
  { value: "doctor", label: "طبيب" },
  { value: "reception", label: "استقبال" },
  { value: "assistant", label: "مساعد" },
];

export default function StaffPage() {
  return (
    <DantalPage title="الكادر">
      <OwnerOnly>
        <StaffPageContent />
      </OwnerOnly>
    </DantalPage>
  );
}

function StaffPageContent() {
  return (
    <>
      <motion.div className="mb-8" {...slideUp}>
        <h1 className="dantal-title">الكادر</h1>
        <p className="dantal-subtitle mt-2">إدارة الموظفين وحسابات الدخول</p>
      </motion.div>
      <StaffContent />
    </>
  );
}

function StaffContent() {
  const db = useDbStore((s) => s.db);
  const addStaff = useDbStore((s) => s.addStaff);
  const updateStaff = useDbStore((s) => s.updateStaff);
  const deleteStaff = useDbStore((s) => s.deleteStaff);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | undefined>();

  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("doctor");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [commissionPct, setCommissionPct] = useState("0");

  function openAdd() {
    setEditing(undefined);
    setName("");
    setRole("doctor");
    setPhone("");
    setPin("");
    setCommissionPct("0");
    setModalOpen(true);
  }

  function openEdit(m: StaffMember) {
    setEditing(m);
    setName(m.name);
    setRole(m.role);
    setPhone(m.phone || "");
    setPin(m.pin || "");
    setCommissionPct(String(m.commissionPct ?? 0));
    setModalOpen(true);
  }

  function save() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      role,
      phone: phone.trim(),
      pin: pin.trim(),
      commissionPct: Number(commissionPct) || 0,
    };
    if (editing) {
      updateStaff(editing.id, { ...payload, updatedAt: Date.now() });
    } else {
      addStaff(payload);
    }
    setModalOpen(false);
  }

  function remove(id: string, isOwner?: boolean) {
    if (isOwner) return;
    if (!confirm("حذف هذا العضو؟")) return;
    deleteStaff(id);
  }

  return (
    <>
      {isBackendAuthed() ? (
        <motion.div className="mb-10 rounded-[20px] border border-[#d1dde3] bg-white p-5 sm:p-6" {...slideUp}>
          <h2 className="text-lg font-bold text-[#366F7F]">حسابات دخول الموظفين</h2>
          <p className="mt-2 text-sm text-muted">
            أنشئ بريداً وكلمة مرور لكل موظف — يدخل من صفحة تسجيل الدخول مباشرة (بدون PIN).
          </p>
          <div className="mt-4">
            <ClinicTeamSection />
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="mb-10 rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
          {...slideUp}
        >
          لإنشاء حسابات دخول للموظفين (بريد + كلمة مرور)، سجّل دخولك أولاً من صفحة الدخول بحساب مدير العيادة
          — ليس عبر PIN المحلي.
        </motion.div>
      )}

      <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h2 className="text-lg font-bold text-foreground">الكادر الطبي (أسماء وعمولات)</h2>
          <p className="dantal-subtitle mt-2">قائمة الأطباء والموظفين داخل العيادة — للعرض والعمولات</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          عضو جديد
        </Button>
      </motion.div>

      {db.staff.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد كادر" description="أضف أعضاء الفريق للبدء" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>الاسم</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>العمولة %</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.staff.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-semibold">{m.name}</TableCell>
                <TableCell>
                  <Badge variant={m.isOwner ? "secondary" : "primary"}>
                    {m.isOwner ? "مالك" : ROLE_LABEL[m.role] || m.role}
                  </Badge>
                </TableCell>
                <TableCell>{m.phone || "—"}</TableCell>
                <TableCell>{m.commissionPct ?? 0}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <IconButton label="تعديل" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    {!m.isOwner && (
                      <IconButton label="حذف" variant="danger" onClick={() => remove(m.id, m.isOwner)}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "تعديل عضو" : "عضو جديد"}>
        <ModalBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" value={name} onChange={(e) => setName(e.target.value)} />
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground-secondary">الدور</label>
              <Select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input label="الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="PIN" type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
            <Input
              label="نسبة العمولة %"
              type="number"
              value={commissionPct}
              onChange={(e) => setCommissionPct(e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={save}>حفظ</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
