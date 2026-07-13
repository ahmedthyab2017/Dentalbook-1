"use client";

import { Tabs } from "@/components/ds";

const TABS: { id: string; label: string }[] = [
  { id: "info", label: "المعلومات" },
  { id: "plans", label: "الخطط" },
  { id: "appts", label: "المواعيد" },
  { id: "rx", label: "الوصفات" },
  { id: "pays", label: "الدفعات" },
  { id: "chart", label: "المخطط" },
  { id: "portal", label: "البوابة" },
  { id: "audit", label: "السجل" },
];

export function ProfileTabs({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  return (
    <div className="mb-6 overflow-x-auto pb-1">
      <Tabs tabs={TABS} active={active} onChange={onChange} className="min-w-max" />
    </div>
  );
}
