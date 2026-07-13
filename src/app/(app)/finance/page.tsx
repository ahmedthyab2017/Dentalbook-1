"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, Wallet, Receipt, Users, TrendingUp } from "lucide-react";
import { DantalPage } from "@/components/layout/DantalPage";
import { OwnerOnly } from "@/components/OwnerOnly";
import {
  Button,
  EmptyState,
  KpiCard,
  Modal,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Avatar,
  IconButton,
  Card,
} from "@/components/ds";
import { useDbStore } from "@/stores/useDbStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { slideUp } from "@/lib/motion";
import {
  allDebtors,
  doctorCommissions,
  doctorGrossSince,
  doctorLastSettledAt,
  createSettlement,
  payMethodLabel,
} from "@/lib/finance-utils";
import { fmtMoney, fmtDateShort, todayStr } from "@/lib/format";
import { waLink } from "@/lib/wa";

type FinTab = "payments" | "expenses" | "debtors" | "commissions" | "settlement";

const TABS: { id: FinTab; label: string }[] = [
  { id: "payments", label: "المدفوعات" },
  { id: "expenses", label: "المصاريف" },
  { id: "debtors", label: "المديونين" },
  { id: "commissions", label: "العمولات" },
  { id: "settlement", label: "التسوية" },
];

export default function FinancePage() {
  return (
    <DantalPage title="المالية">
        <OwnerOnly>
          <FinanceContent />
        </OwnerOnly>
      </DantalPage>
  );
}

function FinanceContent() {
  const [tab, setTab] = useState<FinTab>("payments");

  return (
    <>
      <motion.div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" {...slideUp}>
        <div>
          <h1 className="dantal-title">المالية</h1>
          <p className="dantal-subtitle mt-2">المدفوعات، المصاريف، الديون، والتسويات</p>
        </div>
      </motion.div>

      <div className="mb-6 overflow-x-auto pb-1">
        <Tabs
          tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
          active={tab}
          onChange={(id) => setTab(id as FinTab)}
          className="min-w-max"
        />
      </div>

      <div>
        {tab === "payments" && <PaymentsTab />}
        {tab === "expenses" && <ExpensesTab />}
        {tab === "debtors" && <DebtorsTab />}
        {tab === "commissions" && <CommissionsTab />}
        {tab === "settlement" && <SettlementTab />}
      </div>
    </>
  );
}

function PaymentsTab() {
  const db = useDbStore((s) => s.db);
  const addPayment = useDbStore((s) => s.addPayment);
  const deletePayment = useDbStore((s) => s.deletePayment);
  const [modalOpen, setModalOpen] = useState(false);
  const [ptId, setPtId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");

  const today = todayStr();
  const monthPrefix = today.slice(0, 7);
  const total = db.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const todayTotal = db.payments.filter((p) => p.date === today).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const monthTotal = db.payments.filter((p) => p.date?.startsWith(monthPrefix)).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const list = [...db.payments].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 150);

  function save() {
    if (!ptId || !(Number(amount) > 0)) return;
    addPayment({ ptId, amount: Number(amount), method, date, note });
    setModalOpen(false);
    setAmount("");
    setNote("");
  }

  return (
    <>
      <div className="mb-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="إجمالي الوارد" value={fmtMoney(total)} icon={Wallet} accent="success" />
        <KpiCard label="اليوم" value={fmtMoney(todayTotal)} icon={TrendingUp} accent="primary" />
        <KpiCard label="هذا الشهر" value={fmtMoney(monthTotal)} icon={Receipt} accent="secondary" />
        <KpiCard label="عدد المعاملات" value={String(db.payments.length)} icon={Users} accent="warning" />
      </div>
      <Button className="mb-6" onClick={() => setModalOpen(true)}>
        <Plus className="h-4 w-4" />
        دفعة جديدة
      </Button>
      {list.length === 0 ? (
        <EmptyState icon={Wallet} title="لا مدفوعات" description="سجّل أول دفعة للبدء" />
      ) : (
        <div className="space-y-2">
          {list.map((p) => {
            const pt = db.patients.find((x) => x.id === p.ptId);
            return (
              <Card key={p.id} className="flex items-center gap-4 p-4">
                <Avatar name={pt?.name || "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground">{pt?.name || "—"}</div>
                  <div className="text-sm text-muted">{payMethodLabel(p.method)} · {fmtDateShort(p.date)}</div>
                  {p.note && <div className="text-xs text-muted">{p.note}</div>}
                </div>
                <div className="text-lg font-bold text-success">{fmtMoney(p.amount)}</div>
                <IconButton label="حذف" variant="danger" onClick={() => { if (confirm("حذف؟")) deletePayment(p.id); }}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="دفعة جديدة">
        <ModalBody className="space-y-4">
          <div>
            <label htmlFor="fin-pt" className="mb-2 block text-sm font-medium text-foreground-secondary">المريض</label>
            <Select id="fin-pt" value={ptId} onChange={(e) => setPtId(e.target.value)}>
              <option value="">— اختر —</option>
              {db.patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <Input label="المبلغ" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <div>
            <label htmlFor="fin-method" className="mb-2 block text-sm font-medium text-foreground-secondary">طريقة الدفع</label>
            <Select id="fin-method" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">نقدي</option>
              <option value="card">بطاقة</option>
              <option value="transfer">تحويل</option>
              <option value="zaincash">زين كاش</option>
            </Select>
          </div>
          <Input label="التاريخ" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button>
          <Button onClick={save}>حفظ</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function ExpensesTab() {
  const db = useDbStore((s) => s.db);
  const addExpense = useDbStore((s) => s.addExpense);
  const deleteExpense = useDbStore((s) => s.deleteExpense);
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState("");

  const total = db.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const list = [...db.expenses].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 100);

  function save() {
    if (!(Number(amount) > 0)) return;
    addExpense({ category: category.trim() || "عام", amount: Number(amount), date, notes });
    setModalOpen(false);
  }

  return (
    <>
      <div className="mb-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="إجمالي المصاريف" value={fmtMoney(total)} icon={Receipt} accent="warning" />
        <KpiCard label="عدد المعاملات" value={String(db.expenses.length)} icon={Wallet} accent="primary" />
      </div>
      <Button className="mb-6" onClick={() => setModalOpen(true)}>
        <Plus className="h-4 w-4" />
        مصروف جديد
      </Button>
      {list.length === 0 ? (
        <EmptyState icon={Receipt} title="لا مصاريف" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>التاريخ</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>ملاحظات</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{fmtDateShort(e.date)}</TableCell>
                <TableCell>{e.category}</TableCell>
                <TableCell className="font-semibold text-danger">{fmtMoney(e.amount)}</TableCell>
                <TableCell className="text-muted">{e.notes || e.description || "—"}</TableCell>
                <TableCell>
                  <IconButton label="حذف" variant="danger" onClick={() => { if (confirm("حذف؟")) deleteExpense(e.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="مصروف جديد">
        <ModalBody className="space-y-4">
          <Input label="التصنيف" value={category} onChange={(e) => setCategory(e.target.value)} />
          <Input label="المبلغ" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="التاريخ" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button>
          <Button onClick={save}>حفظ</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

function DebtorsTab() {
  const db = useDbStore((s) => s.db);
  const router = useRouter();
  const debtors = allDebtors(db);
  const totalDebt = debtors.reduce((s, d) => s + d.debt, 0);

  return (
    <>
      <div className="mb-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="إجمالي الديون" value={fmtMoney(totalDebt)} icon={Wallet} accent="warning" />
        <KpiCard label="عدد المديونين" value={String(debtors.length)} icon={Users} accent="danger" />
      </div>
      {debtors.length === 0 ? (
        <EmptyState icon={Users} title="لا مديونين" description="جميع المرضى مسدّدون" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>المريض</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الرصيد</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.map(({ patient, debt }) => (
              <TableRow key={patient.id}>
                <TableCell className="font-semibold">{patient.name}</TableCell>
                <TableCell className="text-muted">{patient.phone || "—"}</TableCell>
                <TableCell className="font-semibold text-warning">{fmtMoney(debt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => router.push(`/patients/${patient.id}`)}>فتح</Button>
                    {patient.phone && (
                      <Button size="sm" variant="ghost" onClick={() => window.open(waLink(patient.phone!, `مرحباً ${patient.name}، لديك رصيد ${debt} د.ع`), "_blank")}>
                        واتساب
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

function CommissionsTab() {
  const db = useDbStore((s) => s.db);
  const rows = doctorCommissions(db);
  return rows.length === 0 ? (
    <EmptyState icon={TrendingUp} title="لا بيانات عمولات" />
  ) : (
    <Table>
      <TableHeader>
        <TableRow hover={false}>
          <TableHead>الطبيب</TableHead>
          <TableHead>النسبة</TableHead>
          <TableHead>الخطط المكتملة</TableHead>
          <TableHead>العمولة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.doctor.id}>
            <TableCell className="font-semibold">{r.doctor.name}</TableCell>
            <TableCell>{r.pct}%</TableCell>
            <TableCell>{r.planCount}</TableCell>
            <TableCell className="font-semibold text-success">{fmtMoney(r.commission)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SettlementTab() {
  const db = useDbStore((s) => s.db);
  const addSettlement = useDbStore((s) => s.addSettlement);
  const archiveAccounts = useDbStore((s) => s.archiveAccounts);
  const user = useSessionStore((s) => s.user);
  const doctors = db.staff.filter((s) => s.role === "doctor" || s.isOwner);

  function archiveAll() {
    if (!confirm("⚠️ أرشفة كل الحسابات وتصفير أرصدة الأطباء؟")) return;
    const reason = prompt("سبب الأرشفة (إلزامي):")?.trim();
    if (!reason) return;
    archiveAccounts(user?.name || "owner", reason);
    alert("✓ تمت الأرشفة وتصفير الحسابات");
  }

  function settle(doctorId: string) {
    const mode = confirm("هل الطبيب يحتفظ بالمال؟ (موافق = نعم / إلغاء = العيادة تحتفظ)")
      ? "doctor_holds" as const
      : "clinic_holds" as const;
    const settlement = createSettlement(db, doctorId, mode, user?.name || "owner");
    if (settlement.gross <= 0) return;
    addSettlement(settlement);
  }

  const history = [...db.settlements].sort((a, b) => b.at - a.at).slice(0, 30);
  const archives = [...(db.archives || [])].sort((a, b) => b.at - a.at).slice(0, 10);

  return (
    <>
      <Button variant="danger" size="sm" className="mb-4" onClick={archiveAll}>
        أرشفة وتصفير الحسابات
      </Button>
      <p className="mb-6 text-sm text-muted">تسوية حسابات الأطباء بناءً على المدفوعات المرتبطة بخطط العلاج.</p>
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            <TableHead>الطبيب</TableHead>
            <TableHead>النسبة</TableHead>
            <TableHead>وارد منذ آخر تسوية</TableHead>
            <TableHead>حصة الطبيب</TableHead>
            <TableHead>حصة العيادة</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doc) => {
            const since = doctorLastSettledAt(db, doc.id);
            const gross = doctorGrossSince(db, doc.id, since);
            const pct = Number(doc.commissionPct) || 0;
            const docShare = gross * (pct / 100);
            return (
              <TableRow key={doc.id}>
                <TableCell className="font-semibold">{doc.name}</TableCell>
                <TableCell>{pct}%</TableCell>
                <TableCell>{fmtMoney(gross)}</TableCell>
                <TableCell>{fmtMoney(docShare)}</TableCell>
                <TableCell>{fmtMoney(gross - docShare)}</TableCell>
                <TableCell>
                  <Button size="sm" disabled={gross <= 0} onClick={() => settle(doc.id)}>تسوية</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-base font-semibold text-foreground">سجل التسويات</h3>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>التاريخ</TableHead>
                <TableHead>الطبيب</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>حصة الطبيب</TableHead>
                <TableHead>الوضع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{fmtDateShort(new Date(s.at).toISOString().slice(0, 10))}</TableCell>
                  <TableCell>{s.doctorName}</TableCell>
                  <TableCell>{fmtMoney(s.gross)}</TableCell>
                  <TableCell>{fmtMoney(s.doctorShare)}</TableCell>
                  <TableCell>{s.mode === "doctor_holds" ? "الطبيب" : "العيادة"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {archives.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-base font-semibold text-foreground">الأرشيف</h3>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>التاريخ</TableHead>
                <TableHead>بواسطة</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>إجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archives.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{fmtDateShort(new Date(a.at).toISOString().slice(0, 10))}</TableCell>
                  <TableCell>{a.by}</TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell>{fmtMoney(a.totals?.settledGross || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
