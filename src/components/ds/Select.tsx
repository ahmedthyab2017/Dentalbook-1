import { cn } from "@/lib/cn";

export function DantalSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "dantal-focus h-11 w-full rounded-[var(--radius-input)] border border-border bg-surface px-4 text-sm text-foreground",
        "hover:border-muted focus:border-primary",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
