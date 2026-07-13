"use client";

import { cn } from "@/lib/cn";
import { EmptyState } from "./EmptyState";
import { SkeletonTable } from "./Skeleton";
import { Inbox } from "lucide-react";

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="dantal-table-scroll">
      <table className={cn("w-full min-w-[640px] border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "sticky top-0 z-10 border-b border-border bg-border-subtle/80 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border-subtle bg-surface", className)} {...props} />;
}

export function TableRow({
  className,
  hover = true,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }) {
  return (
    <tr
      className={cn(hover && "transition-colors hover:bg-border-subtle/60", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3.5 text-foreground", className)} {...props} />;
}

export function TableEmpty({ title = "لا توجد بيانات", description }: { title?: string; description?: string }) {
  return (
    <tr>
      <td colSpan={100}>
        <EmptyState icon={Inbox} title={title} description={description} className="border-0 bg-transparent" />
      </td>
    </tr>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <tr>
      <td colSpan={100} className="p-4">
        <SkeletonTable rows={rows} />
      </td>
    </tr>
  );
}
