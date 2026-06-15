import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <div className="luxury-container grid gap-6 md:grid-cols-3">
        <Skeleton className="h-96 md:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
        </div>
      </div>
    </main>
  );
}
