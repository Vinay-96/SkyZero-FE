import { Suspense } from "react";
import HoldingsTable from "@/components/reports/insiderTrades/InsiderMovement";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function HoldingsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full"
      )}
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Ownership Evolution Tracker
        </h1>
        <p className="text-muted-foreground">
          Recent changes in institutional and insider shareholdings
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <HoldingsTable />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="rounded-lg border shadow-sm overflow-hidden">
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  </div>
);
