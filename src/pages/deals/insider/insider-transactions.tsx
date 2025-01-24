import { Suspense } from "react";
import TransactionDashboard from "@/components/reports/insiderTrades/InsiderTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full"
      )}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <TransactionDashboard />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full")}>
    <div className="space-y-6">
      <Skeleton className="h-8 w-[300px]" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
