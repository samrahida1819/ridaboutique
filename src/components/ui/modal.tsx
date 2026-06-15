"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-brand-charcoal/55 p-4 backdrop-blur-sm">
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn("max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[1.75rem] bg-brand-ivory p-6 shadow-luxury", className)}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-brand-green">{title}</h2>
          <Button aria-label="Close modal" onClick={onClose} size="icon" variant="secondary">
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
