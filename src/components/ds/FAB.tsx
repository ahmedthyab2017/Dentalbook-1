"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { buttonTap } from "@/lib/motion";

export function FAB({
  onClick,
  children,
  label,
  className,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "dantal-focus fixed z-50 flex items-center gap-2 rounded-[var(--radius-button)]",
        "bg-primary text-sm font-semibold text-white shadow-[var(--shadow-soft-lg)]",
        "hover:bg-primary-hover hover:shadow-[var(--shadow-soft-hover)] hover:-translate-y-0.5",
        "transition-all duration-200",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] end-[max(1rem,env(safe-area-inset-right))]",
        "h-12 px-4 sm:bottom-8 sm:end-8 sm:h-14 sm:px-5",
        className
      )}
      {...buttonTap}
    >
      {children}
    </motion.button>
  );
}
