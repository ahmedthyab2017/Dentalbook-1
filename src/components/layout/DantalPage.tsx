"use client";

import { DantalTopbar } from "@/components/layout/DantalTopbar";
import { cn } from "@/lib/cn";

/** Standard page wrapper — Dantal DS layout for all app routes */
export function DantalPage({
  title,
  children,
  className,
  fullWidth,
  search,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
}) {
  return (
    <>
      <DantalTopbar title={title} search={search} />
      <div className={cn("dantal-page", !fullWidth && "dantal-container", className)}>{children}</div>
    </>
  );
}
