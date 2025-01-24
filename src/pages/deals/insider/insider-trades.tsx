import { Suspense } from "react";
import StockTransactionsView from "@/components/reports/insiderTrades/InsiderTrades";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StockTransactionsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full"
      )}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <StockTransactionsView />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4")}>
    <div className="space-y-2">
      <Skeleton className="h-8 w-[300px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-md" />
        ))}
      </div>

      <div className="rounded-md border shadow-sm">
        <div className="space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
