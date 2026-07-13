"use client";

import { cn } from "@/lib/cn";

export function Tabs({
  tabs,
  active,
  onChange,
  className,
  variant = "default",
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "default" | "pill";
}) {
  const isPill = variant === "pill";

  return (
    <div
      className={cn(
        isPill
          ? "inline-flex gap-1 rounded-[14px] bg-border-subtle/80 p-1"
          : "inline-flex gap-1 rounded-[14px] border border-border bg-border-subtle/50 p-1",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "dantal-focus whitespace-nowrap rounded-[11px] px-4 py-2 text-sm font-semibold transition-all duration-200",
              selected
                ? isPill
                  ? "bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                  : "bg-surface text-foreground shadow-[var(--shadow-soft)] ring-1 ring-border/60"
                : "text-muted hover:bg-surface/60 hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  "ms-1.5 rounded-full px-1.5 py-0.5 text-xs font-bold",
                  selected && isPill ? "bg-white/20 text-white" : "bg-border-subtle text-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
