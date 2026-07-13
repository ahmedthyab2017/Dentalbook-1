"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, placeholder = "بحث…", ...props }, ref) => (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        className={cn(
          "dantal-focus h-10 w-full rounded-[var(--radius-input)] border border-border bg-surface ps-10 pe-4 text-sm",
          "placeholder:text-muted hover:border-muted focus:border-primary",
          className
        )}
        {...props}
      />
    </div>
  )
);
SearchInput.displayName = "SearchInput";
