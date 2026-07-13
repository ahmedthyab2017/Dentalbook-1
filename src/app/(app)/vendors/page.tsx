"use client";

import { useState } from "react";
import { DantalPage } from "@/components/layout/DantalPage";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDbStore } from "@/stores/useDbStore";
import { waLink } from "@/lib/wa";
import type { Vendor } from "@/types/db";

const CATEGORIES = [
  { id: "lab", icon: "🔬", label: "مختبرات" },
  { id: "office", icon: "🏢", label: "مكاتب" },
  { id: "supplies", icon: "📦", label: "مستلزمات" },
  { id: "xray", icon: "🩻", label: "أشعة" },
  { id: "other", icon: "🔗", label: "أخرى" },
] as const;

type CatId = (typeof CATEGORIES)[number]["id"] | "all";

export default function VendorsPage() {
  const db = useDbStore((s) => s.db);
  const addVendor = useDbStore((s) => s.addVendor);
  const updateVendor = useDbStore((s) => s.updateVendor);
  const deleteVendor = useDbStore((s) => s.deleteVendor);

  const [filter, setFilter] = useState<CatId>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | undefined>();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("lab");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const list = db.vendors.map((v) => ({
    ...v,
    _cat: CATEGORIES.some((c) => c.id === v.category) ? v.category : "other",
  }));

  const counts: Record<string, number> = { all: list.length };
  CATEGORIES.forEach((c) => {
    counts[c.id] = list.filter((v) => v._cat === c.id).length;
  });

  const shown = filter === "all" ? list : list.filter((v) => v._cat === filter);

  function openAdd() {
    setEditing(undefined);
    setName("");
    setCategory("lab");
    setPhone("");
    setAddress("");
    setNotes("");
    setModalOpen(true);
  }

  function openEdit(v: Vendor) {
    setEditing(v);
    setName(v.name);
    setCategory(v.category || "lab");
    setPhone(v.phone || "");
    setAddress(v.address || "");
    setNotes(v.notes || "");
    setModalOpen(true);
  }

  function save() {
    if (!name.trim()) return;
    const payload = { name: name.trim(), category, phone: phone.trim(), address: address.trim(), notes: notes.trim() };
    if (editing) updateVendor(editing.id, { ...payload, updatedAt: Date.now() });
    else addVendor(payload);
    setModalOpen(false);
  }

  return (
    <DantalPage title="جهات نتعامل معها">
        <div className="page-head">
          <h1 className="page-title">جهات نتعامل معها</h1>
          <button className="btn btn-primary" onClick={openAdd}>
            + جهة جديدة
          </button>
        </div>

        <div className="chips vendor-chips">
          <button className={`chip${filter === "all" ? " active" : ""}`} onClick={() => setFilter("all")}>
            الكل <b>{counts.all}</b>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip${filter === c.id ? " active" : ""}`}
              onClick={() => setFilter(c.id)}
            >
              {c.icon} {c.label} <b>{counts[c.id]}</b>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState>لا توجد جهات بعد</EmptyState>
        ) : shown.length === 0 ? (
          <EmptyState>لا جهات في هذا التصنيف</EmptyState>
        ) : (
          <div className="vendor-grid">
            {shown.map((v) => {
              const meta = CATEGORIES.find((c) => c.id === v._cat) || CATEGORIES[4];
              return (
                <div className={`vendor-card cat-${meta.id}`} key={v.id}>
                  <div className="vendor-card-top">
                    <div className="vendor-ico">{meta.icon}</div>
                    <div className="vendor-main">
                      <div className="vendor-name">{v.name}</div>
                      <div className="vendor-cat">{meta.label}</div>
                    </div>
                    <div className="vendor-actions">
                      <button className="icon-btn" onClick={() => openEdit(v)}>
                        ✎
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => {
                          if (confirm("حذف؟")) deleteVendor(v.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {v.address && <div className="vendor-meta">📍 {v.address}</div>}
                  {v.notes && <div className="vendor-meta">📝 {v.notes}</div>}
                  {v.phone && (
                    <div className="vendor-contact">
                      <a className="vendor-call" href={`tel:${v.phone}`}>
                        📞 {v.phone}
                      </a>
                      <a className="vendor-wa" href={waLink(v.phone, "")} target="_blank" rel="noreferrer">
                        💬
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "تعديل" : "جهة جديدة"}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field">
              <label>الاسم</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>التصنيف</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>الهاتف</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field full">
              <label>العنوان</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="field full">
              <label>ملاحظات</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={save}>
            حفظ
          </button>
        </div>
      </Modal>
    </DantalPage>
  );
}
