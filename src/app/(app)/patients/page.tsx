"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { DantalPatientCard } from "@/components/patients/DantalPatientCard";
import { AddEditPatientModal } from "@/components/patients/AddEditPatientModal";
import { Button, SearchInput, EmptyState } from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { patientDebt, lastSessionDate } from "@/lib/patients";
import { slideUp } from "@/lib/motion";

export default function PatientsPage() {
  const db = useDbStore((s) => s.db);
  const ptFilter = useSessionStore((s) => s.ptFilter);
  const setPtFilter = useSessionStore((s) => s.setPtFilter);
  const [modalOpen, setModalOpen] = useState(false);

  const q = (ptFilter || "").toLowerCase();
  let list = db.patients;
  if (q) {
    list = list.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.phone || "").includes(q) ||
        (p.id || "").toLowerCase().includes(q)
    );
  }
  list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <DantalPage
      title="المرضى"
      search={{ value: ptFilter, onChange: setPtFilter, placeholder: "بحث بالاسم أو الهاتف…" }}
    >
      <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h1 className="dantal-title">المرضى</h1>
          <p className="dantal-subtitle mt-2">
            {list.length} مريض{list.length === 1 ? "" : ""} مسجل
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          مريض جديد
        </Button>
      </motion.div>

      <div className="mb-6 md:hidden">
        <SearchInput
          placeholder="بحث بالاسم أو الهاتف…"
          value={ptFilter}
          onChange={(e) => setPtFilter(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا يوجد مرضى"
          description={q ? "لا نتائج مطابقة للبحث" : "ابدأ بإضافة أول مريض للعيادة"}
          action={
            !q ? (
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                إضافة مريض
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {list.map((p, i) => (
            <motion.div key={p.id} {...slideUp} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <DantalPatientCard
                patient={p}
                debt={patientDebt(db, p.id)}
                lastSession={lastSessionDate(db, p.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <AddEditPatientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DantalPage>
  );
}
