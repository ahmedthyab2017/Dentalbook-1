"use client";

import { type HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { cardHover } from "@/lib/motion";

const cardClass = (hover: boolean, className?: string) =>
  cn(
    "rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)]",
    hover && "cursor-default transition-shadow hover:shadow-[var(--shadow-soft-lg)]",
    className
  );

export function Card({
  className,
  hover = false,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  if (hover) {
    return (
      <motion.div className={cardClass(true, className)} {...cardHover}>
        {children}
      </motion.div>
    );
  }
  return (
    <div className={cardClass(false, className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border-subtle px-6 py-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-muted", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-3 border-t border-border-subtle px-6 py-4", className)}
      {...props}
    />
  );
}
