import { Suspense } from "react";
import MinimalTransactions from "@/components/reports/sastTrades/SastTrades";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full",
        "bg-background"
      )}
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Corporate Transaction Monitoring
        </h1>
        <p className="text-muted-foreground">
          Recent significant corporate share transactions and disclosures
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <MinimalTransactions />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <div className="p-4 pt-0 space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              {[...Array(2)].map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
