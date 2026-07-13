"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { fadeScaleIn } from "@/lib/motion";
import { IconButton } from "./IconButton";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-[760px]",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal>
          <motion.div
            className="absolute inset-0 bg-dark-bg/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-[var(--radius-dialog)] border border-border bg-surface shadow-[var(--shadow-soft-lg)]",
              sizes[size],
              className
            )}
            {...fadeScaleIn}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                <IconButton label="Close" onClick={onClose}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-4 sm:px-6 sm:py-5", className)} {...props} />;
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-3 border-t border-border-subtle px-4 py-4 sm:px-6", className)}
      {...props}
    />
  );
}
