"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  className
}: {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) {
    return null;
  }

  const hiddenX = side === "right" ? 48 : -48;

  return (
    <div className="fixed inset-0 z-[75] bg-brand-charcoal/50 backdrop-blur-sm">
      <motion.aside
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "absolute top-0 h-full w-full max-w-md overflow-auto bg-brand-ivory p-6 shadow-luxury",
          side === "right" ? "right-0" : "left-0",
          className
        )}
        initial={{ opacity: 0, x: hiddenX }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-brand-green">{title}</h2>
          <Button aria-label="Close drawer" onClick={onClose} size="icon" variant="secondary">
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </motion.aside>
    </div>
  );
}
