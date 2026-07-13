"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DantalPage } from "@/components/layout/DantalPage";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDbStore } from "@/stores/useDbStore";
import { fmtDateShort } from "@/lib/format";
import type { CaseCategory } from "@/types/db";

const CATEGORIES: { id: CaseCategory | "all"; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "implant", label: "زراعة" },
  { id: "ortho", label: "تقويم" },
  { id: "smile", label: "ابتسامة" },
  { id: "general", label: "عام" },
];

const CAT_LABEL: Record<CaseCategory, string> = {
  implant: "زراعة",
  ortho: "تقويم",
  smile: "ابتسامة",
  general: "عام",
};

export default function CasesPage() {
  const router = useRouter();
  const db = useDbStore((s) => s.db);
  const [filter, setFilter] = useState<CaseCategory | "all">("all");

  let list = [...db.cases];
  if (filter !== "all") list = list.filter((c) => c.category === filter);
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <DantalPage title="توثيق الحالات">
        <div className="page-head">
          <h1 className="page-title">توثيق الحالات</h1>
          <button className="btn btn-primary" onClick={() => router.push("/cases/new")}>
            + حالة جديدة
          </button>
        </div>

        <div className="chips">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip${filter === c.id ? " active" : ""}`}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState>لا توجد حالات</EmptyState>
        ) : (
          <div className="case-grid">
            {list.map((c) => {
              const before = c.photosBefore.find((p) => p.isFlagship) || c.photosBefore[0];
              const after = c.photosAfter.find((p) => p.isFlagship) || c.photosAfter[0];
              return (
                <div
                  className="case-card"
                  key={c.id}
                  onClick={() => router.push(`/cases/${c.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="case-thumbs">
                    {before ? (
                      <img src={before.dataUrl} alt="before" className="case-thumb" />
                    ) : (
                      <div className="case-thumb empty">قبل</div>
                    )}
                    {after ? (
                      <img src={after.dataUrl} alt="after" className="case-thumb" />
                    ) : (
                      <div className="case-thumb empty">بعد</div>
                    )}
                  </div>
                  <div className="case-info">
                    <b>{c.ptName}</b>
                    <div className="muted">{c.treatmentType || "—"}</div>
                    <span className="badge badge-info">{CAT_LABEL[c.category]}</span>
                    <div className="muted">{fmtDateShort(c.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DantalPage>
  );
}
