"use client";

import { motion } from "framer-motion";
import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { cardHover, slideUp } from "@/lib/motion";

export function KpiCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  accent = "primary",
  className,
}: {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}) {
  const accents = {
    primary: "bg-primary-muted text-primary",
    secondary: "bg-secondary/15 text-secondary",
    success: "bg-success-muted text-success",
    warning: "bg-warning-muted text-warning",
    danger: "bg-danger-muted text-danger",
  };

  const positive = change != null && change >= 0;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)]",
        "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-l",
        accent === "primary" && "before:from-primary before:to-primary/40",
        accent === "secondary" && "before:from-secondary before:to-secondary/40",
        accent === "success" && "before:from-success before:to-success/40",
        accent === "warning" && "before:from-warning before:to-warning/40",
        accent === "danger" && "before:from-danger before:to-danger/40",
        "transition-shadow hover:shadow-[var(--shadow-soft-lg)]",
        className
      )}
      {...slideUp}
      {...cardHover}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change != null && (
            <div className="mt-2 flex items-center gap-1.5 text-sm">
              {positive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger" />
              )}
              <span className={positive ? "text-success" : "text-danger"}>
                {positive ? "+" : ""}
                {change}%
              </span>
              {changeLabel && <span className="text-muted">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]", accents[accent])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}
