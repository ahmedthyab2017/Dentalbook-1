"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DantalPage } from "@/components/layout/DantalPage";
import { useDbStore } from "@/stores/useDbStore";
import { TREATMENT_TYPES } from "@/lib/treatment-types";
import { todayStr } from "@/lib/format";
import { uid } from "@/lib/id";
import { PhotoEditorModal } from "@/components/cases/PhotoEditorModal";
import type { CaseCategory, CaseDoc, CasePhoto, DentistDb } from "@/types/db";

const MAX_PHOTOS = 6;

function buildInitialCase(caseId: string | null, db: DentistDb): CaseDoc | null {
  if (caseId) return db.cases.find((c) => c.id === caseId) ?? null;
  const pt = db.patients[0];
  return {
    id: "",
    ptId: pt?.id || "",
    ptName: pt?.name || "",
    category: "general",
    treatmentType: "",
    date: todayStr(),
    notes: "",
    photosBefore: [],
    photosAfter: [],
    createdAt: Date.now(),
  };
}

export default function CaseEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  return (
    <DantalPage title={isNew ? "حالة جديدة" : "تعديل حالة"}>
        <CaseEditor key={id ?? "new"} caseId={isNew ? null : id} />
      </DantalPage>
  );
}

function CaseEditor({ caseId }: { caseId: string | null }) {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const addCase = useDbStore((s) => s.addCase);
  const updateCase = useDbStore((s) => s.updateCase);
  const deleteCase = useDbStore((s) => s.deleteCase);

  const [caseDoc, setCaseDoc] = useState<CaseDoc | null>(() => buildInitialCase(caseId, db));
  const [editPhoto, setEditPhoto] = useState<{ kind: "photosBefore" | "photosAfter"; id: string; src: string } | null>(null);

  if (!caseDoc) return <p className="muted">لم يتم العثور على الحالة</p>;

  function patch(p: Partial<CaseDoc>) {
    setCaseDoc((prev) => (prev ? { ...prev, ...p } : prev));
  }

  function save() {
    if (!caseDoc) return;
    if (caseDoc.id) {
      updateCase(caseDoc.id, caseDoc);
    } else {
      const created = addCase({
        ptId: caseDoc.ptId,
        ptName: caseDoc.ptName,
        category: caseDoc.category,
        treatmentType: caseDoc.treatmentType,
        date: caseDoc.date,
        notes: caseDoc.notes,
        photosBefore: caseDoc.photosBefore,
        photosAfter: caseDoc.photosAfter,
      });
      router.replace(`/cases/${created.id}`);
    }
    alert("تم الحفظ");
  }

  function onPtChange(ptId: string) {
    const pt = db.patients.find((p) => p.id === ptId);
    patch({ ptId, ptName: pt?.name || "" });
  }

  async function addPhotos(kind: "photosBefore" | "photosAfter", files: FileList | null) {
    if (!files || !caseDoc) return;
    const current = caseDoc[kind];
    if (current.length >= MAX_PHOTOS) return;

    for (const file of Array.from(files).slice(0, MAX_PHOTOS - current.length)) {
      const dataUrl = await compressImage(file);
      const photo: CasePhoto = { id: uid("ph_"), dataUrl, isFlagship: current.length === 0 };
      current.push(photo);
    }
    patch({ [kind]: [...current] });
  }

  function removePhoto(kind: "photosBefore" | "photosAfter", photoId: string) {
    if (!caseDoc || !confirm("حذف الصورة؟")) return;
    patch({ [kind]: caseDoc[kind].filter((p) => p.id !== photoId) });
  }

  function setFlagship(kind: "photosBefore" | "photosAfter", photoId: string) {
    if (!caseDoc) return;
    patch({
      [kind]: caseDoc[kind].map((p) => ({ ...p, isFlagship: p.id === photoId })),
    });
  }

  function updatePhotoDataUrl(kind: "photosBefore" | "photosAfter", photoId: string, dataUrl: string) {
    if (!caseDoc) return;
    patch({ [kind]: caseDoc[kind].map((p) => (p.id === photoId ? { ...p, dataUrl } : p)) });
  }

  function removeCase() {
    if (!caseDoc?.id || !confirm("حذف الحالة؟")) return;
    deleteCase(caseDoc.id);
    router.push("/cases");
  }

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">{caseDoc.id ? "تعديل حالة" : "حالة جديدة"}</h1>
        <div className="row gap">
          <button className="btn btn-primary" onClick={save}>حفظ</button>
          {caseDoc.id && (
            <button className="btn btn-danger" onClick={removeCase}>حذف</button>
          )}
          <button className="btn btn-ghost" onClick={() => router.push("/cases")}>رجوع</button>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>المريض</label>
          <select value={caseDoc.ptId} onChange={(e) => onPtChange(e.target.value)}>
            {db.patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>التصنيف</label>
          <select value={caseDoc.category} onChange={(e) => patch({ category: e.target.value as CaseCategory })}>
            <option value="general">عام</option>
            <option value="implant">زراعة</option>
            <option value="ortho">تقويم</option>
            <option value="smile">ابتسامة</option>
          </select>
        </div>
        <div className="field">
          <label>نوع العلاج</label>
          <select value={caseDoc.treatmentType || ""} onChange={(e) => patch({ treatmentType: e.target.value })}>
            <option value="">—</option>
            {TREATMENT_TYPES.map((t) => (
              <option key={t.id} value={t.ar}>{t.ar}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>التاريخ</label>
          <input type="date" value={caseDoc.date} onChange={(e) => patch({ date: e.target.value })} />
        </div>
        <div className="field full">
          <label>ملاحظات</label>
          <textarea value={caseDoc.notes || ""} onChange={(e) => patch({ notes: e.target.value })} rows={3} />
        </div>
      </div>

      <PhotoBay
        title="قبل العلاج"
        photos={caseDoc.photosBefore}
        onAdd={(files) => addPhotos("photosBefore", files)}
        onRemove={(id) => removePhoto("photosBefore", id)}
        onFlagship={(id) => setFlagship("photosBefore", id)}
        onEdit={(id, src) => setEditPhoto({ kind: "photosBefore", id, src })}
      />
      <PhotoBay
        title="بعد العلاج"
        photos={caseDoc.photosAfter}
        onAdd={(files) => addPhotos("photosAfter", files)}
        onRemove={(id) => removePhoto("photosAfter", id)}
        onFlagship={(id) => setFlagship("photosAfter", id)}
        onEdit={(id, src) => setEditPhoto({ kind: "photosAfter", id, src })}
      />
      <PhotoEditorModal
        open={!!editPhoto}
        src={editPhoto?.src || ""}
        onClose={() => setEditPhoto(null)}
        onSave={(dataUrl) => {
          if (editPhoto) updatePhotoDataUrl(editPhoto.kind, editPhoto.id, dataUrl);
        }}
      />
    </>
  );
}

function PhotoBay({
  title,
  photos,
  onAdd,
  onRemove,
  onFlagship,
  onEdit,
}: {
  title: string;
  photos: CasePhoto[];
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  onFlagship: (id: string) => void;
  onEdit: (id: string, src: string) => void;
}) {
  return (
    <div className="card mt-3">
      <div className="card-head">
        <h3>{title}</h3>
        <label className="btn btn-sm">
          + إضافة صور
          <input type="file" accept="image/*" multiple hidden onChange={(e) => onAdd(e.target.files)} />
        </label>
      </div>
      <div className="photo-bay">
        {photos.map((p) => (
          <div className="photo-slot" key={p.id}>
            <img src={p.dataUrl} alt="" />
            <div className="photo-slot-actions">
              <button className="icon-btn" title="تحرير" onClick={() => onEdit(p.id, p.dataUrl)}>✏️</button>
              <button className="icon-btn" title="صورة رئيسية" onClick={() => onFlagship(p.id)}>
                {p.isFlagship ? "★" : "☆"}
              </button>
              <button className="icon-btn danger" onClick={() => onRemove(p.id)}>×</button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p className="muted">لا صور</p>}
      </div>
    </div>
  );
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1600;
      let w = img.width;
      let h = img.height;
      if (w > max || h > max) {
        if (w > h) {
          h = (h * max) / w;
          w = max;
        } else {
          w = (w * max) / h;
          h = max;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = url;
  });
}
