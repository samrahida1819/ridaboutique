"use client";

import { useWebsiteContent } from "@/hooks/use-store-data";
import type { WebsiteContentKey } from "@/types/commerce";

export function ManagedContentText({
  className,
  contentKey,
  fallback
}: {
  className?: string;
  contentKey: WebsiteContentKey;
  fallback: string;
}) {
  const { content, loading } = useWebsiteContent(contentKey);
  const body = content[contentKey]?.trim() || fallback;

  return <p className={className}>{loading ? fallback : body}</p>;
}
