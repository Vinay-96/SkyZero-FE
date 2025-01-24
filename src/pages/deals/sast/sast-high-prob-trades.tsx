import { Suspense } from "react";
import HighWinTrades from "@/components/reports/sastTrades/SastHighProbTrades";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TradesPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full" // Increased max-width for better content flow
      )}
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          High-Probability Trading Opportunities
        </h1>
        <p className="text-muted-foreground">
          Curated list of high-confidence market moves based on insider activity
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <HighWinTrades />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <Skeleton className="h-6 w-[200px]" />
      </div>
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-[1px] w-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
