"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={false}
      key={pathname}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
