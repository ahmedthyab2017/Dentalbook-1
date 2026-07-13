"use client";

import { forwardRef, type InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leadingIcon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, leadingIcon: Leading, type, id, ...props }, ref) => {
    const [showPass, setShowPass] = useState(false);
    const inputId = id || label?.replace(/\s/g, "-").toLowerCase();
    const isPassword = type === "password";
    const inputType = isPassword && showPass ? "text" : type;

    return (
      <div className="relative w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-2 block text-sm font-medium text-foreground-secondary",
              error && "text-danger"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Leading && (
            <Leading className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              "dantal-focus h-12 w-full rounded-[var(--radius-input)] border bg-surface px-4 text-sm text-foreground transition-colors sm:h-11",
              "placeholder:text-muted",
              Leading && "ps-10",
              isPassword && "pe-10",
              error
                ? "border-danger focus:border-danger"
                : success
                  ? "border-success"
                  : "border-border hover:border-muted focus:border-primary",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="dantal-focus absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
