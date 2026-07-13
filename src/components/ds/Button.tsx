"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "dantal-focus inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border border-white/10 bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:from-[#4f8ff7] hover:to-[#1d4ed8] hover:shadow-[0_8px_22px_rgba(37,99,235,0.4)] hover:-translate-y-0.5",
        secondary:
          "border border-border bg-surface text-foreground shadow-[var(--shadow-soft)] hover:border-primary/25 hover:bg-primary-muted/40 hover:shadow-[var(--shadow-soft-lg)]",
        soft:
          "border border-primary/15 bg-primary-muted text-primary shadow-none hover:border-primary/30 hover:bg-primary-muted/80",
        ghost: "font-medium text-foreground-secondary hover:bg-border-subtle hover:text-foreground",
        danger:
          "border border-white/10 bg-gradient-to-b from-[#f87171] to-[#ef4444] text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.35)] hover:-translate-y-0.5",
        outline:
          "border-2 border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary-muted/50",
      },
      size: {
        sm: "h-10 px-3.5 text-sm rounded-[12px]",
        md: "h-11 px-5 text-sm rounded-[14px]",
        lg: "h-12 px-7 text-base rounded-[14px]",
        icon: "h-11 w-11 rounded-[12px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }), "active:scale-[0.98]")}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };
