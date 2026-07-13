"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "default" | "ghost" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, variant = "ghost", children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "dantal-focus inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-button)] transition-colors",
        variant === "ghost" && "text-muted hover:bg-border-subtle hover:text-foreground",
        variant === "default" && "border border-border bg-surface text-foreground hover:bg-border-subtle",
        variant === "danger" && "text-danger hover:bg-danger-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";
