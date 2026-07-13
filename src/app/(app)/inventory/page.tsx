"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import {
  Badge,
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
import { fmtMoney } from "@/lib/format";
import type { InventoryItem } from "@/types/db";
import { slideUp } from "@/lib/motion";

export default function InventoryPage() {
  const db = useDbStore((s) => s.db);
  const addInventoryItem = useDbStore((s) => s.addInventoryItem);
  const updateInventoryItem = useDbStore((s) => s.updateInventoryItem);
  const deleteInventoryItem = useDbStore((s) => s.deleteInventoryItem);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | undefined>();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("0");
  const [unit, setUnit] = useState("");
  const [minQty, setMinQty] = useState("0");
  const [cost, setCost] = useState("0");

  function openAdd() {
    setEditing(undefined);
    setName("");
    setQty("0");
    setUnit("");
    setMinQty("0");
    setCost("0");
    setModalOpen(true);
  }

  function openEdit(i: InventoryItem) {
    setEditing(i);
    setName(i.name);
    setQty(String(i.qty ?? 0));
    setUnit(i.unit || "");
    setMinQty(String(i.minQty ?? 0));
    setCost(String(i.cost ?? 0));
    setModalOpen(true);
  }

  function save() {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      qty: Number(qty) || 0,
      unit: unit.trim(),
      minQty: Number(minQty) || 0,
      cost: Number(cost) || 0,
    };
    if (editing) updateInventoryItem(editing.id, payload);
    else addInventoryItem(payload);
    setModalOpen(false);
  }

  return (
    <DantalPage title="المخزون">
      <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h1 className="dantal-title">المخزون</h1>
          <p className="dantal-subtitle mt-2">تتبع الأصناف والكميات</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          صنف جديد
        </Button>
      </motion.div>

      {db.inventory.length === 0 ? (
        <EmptyState icon={Package} title="لا توجد أصناف" description="أضف أصناف المخزون للبدء" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>الصنف</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>الوحدة</TableHead>
              <TableHead>الحد الأدنى</TableHead>
              <TableHead>التكلفة</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.inventory.map((i) => {
              const low = (i.qty || 0) <= (i.minQty || 0);
              return (
                <TableRow key={i.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{i.name}</span>
                      {low && <Badge variant="warning">منخفض</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className={low ? "font-semibold text-warning" : ""}>{i.qty ?? 0}</TableCell>
                  <TableCell>{i.unit || "—"}</TableCell>
                  <TableCell>{i.minQty ?? 0}</TableCell>
                  <TableCell>{fmtMoney(i.cost)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconButton label="تعديل" onClick={() => openEdit(i)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label="حذف"
                        variant="danger"
                        onClick={() => {
                          if (confirm("حذف؟")) deleteInventoryItem(i.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "تعديل صنف" : "صنف جديد"}>
        <ModalBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="الاسم" value={name} onChange={(e) => setName(e.target.value)} className="sm:col-span-2" />
            <Input label="الكمية" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input label="الوحدة" value={unit} onChange={(e) => setUnit(e.target.value)} />
            <Input label="الحد الأدنى" type="number" value={minQty} onChange={(e) => setMinQty(e.target.value)} />
            <Input label="التكلفة" type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={save}>حفظ</Button>
        </ModalFooter>
      </Modal>
    </DantalPage>
  );
}
