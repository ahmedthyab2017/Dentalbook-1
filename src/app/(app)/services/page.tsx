"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import {
  Button,
  EmptyState,
  IconButton,
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
import { useDbStore } from "@/stores/useDbStore";
import { TREATMENT_TYPES } from "@/lib/treatment-types";
import { fmtMoney } from "@/lib/format";
import { uid } from "@/lib/id";
import { slideUp } from "@/lib/motion";
import type { ServiceCatalogItem } from "@/types/db";

function serviceName(s: ServiceCatalogItem): string {
  return s.name || s.nameAr || "—";
}

function serviceCost(s: ServiceCatalogItem): number {
  return Number(s.defaultCost ?? s.price ?? 0);
}

export default function ServicesPage() {
  return (
    <DantalPage title="قائمة الخدمات">
      <OwnerOnly>
        <ServicesContent />
      </OwnerOnly>
    </DantalPage>
  );
}

function ServicesContent() {
  const db = useDbStore((s) => s.db);
  const replaceDb = useDbStore((s) => s.replaceDb);
  const addService = useDbStore((s) => s.addService);
  const updateService = useDbStore((s) => s.updateService);
  const deleteService = useDbStore((s) => s.deleteService);

  useEffect(() => {
    if (db.services.length === 0) {
      const seeded = TREATMENT_TYPES.map((t) => ({
        id: uid("s_"),
        name: t.ar,
        nameEn: t.en,
        defaultCost: t.defaultCost,
        sessions: t.sessions,
      }));
      replaceDb({ ...db, services: seeded });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once when empty
  }, [db.services.length]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceCatalogItem | undefined>();
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [cost, setCost] = useState("0");
  const [sessions, setSessions] = useState("1");

  function openAdd() {
    setEditing(undefined);
    setName("");
    setNameEn("");
    setCost("0");
    setSessions("1");
    setModalOpen(true);
  }

  function openEdit(s: ServiceCatalogItem) {
    setEditing(s);
    setName(serviceName(s));
    setNameEn(s.nameEn || "");
    setCost(String(serviceCost(s)));
    setSessions(String(s.sessions ?? 1));
    setModalOpen(true);
  }

  function save() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      nameEn: nameEn.trim(),
      defaultCost: Number(cost) || 0,
      sessions: Number(sessions) || 1,
    };
    if (editing) updateService(editing.id, payload);
    else addService(payload);
    setModalOpen(false);
  }

  return (
    <>
      <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h1 className="dantal-title">قائمة الخدمات</h1>
          <p className="dantal-subtitle mt-2">إدارة أنواع العلاج والأسعار</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          خدمة جديدة
        </Button>
      </motion.div>

      {db.services.length === 0 ? (
        <EmptyState icon={Stethoscope} title="لا توجد خدمات" description="أضف خدمات العلاج للبدء" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>الاسم (AR)</TableHead>
              <TableHead>الاسم (EN)</TableHead>
              <TableHead>التكلفة</TableHead>
              <TableHead>الجلسات</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-semibold">{serviceName(s)}</TableCell>
                <TableCell>{s.nameEn || "—"}</TableCell>
                <TableCell>{fmtMoney(serviceCost(s))}</TableCell>
                <TableCell>{s.sessions ?? 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <IconButton label="تعديل" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="حذف"
                      variant="danger"
                      onClick={() => {
                        if (confirm("حذف؟")) deleteService(s.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "تعديل خدمة" : "خدمة جديدة"}>
        <ModalBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم (عربي)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="الاسم (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            <Input label="التكلفة" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            <Input label="الجلسات" type="number" value={sessions} onChange={(e) => setSessions(e.target.value)} />
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
