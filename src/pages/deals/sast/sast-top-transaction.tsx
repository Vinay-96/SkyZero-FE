import { Suspense } from "react";
import MarketActivity from "@/components/reports/sastTrades/SastTopTransaction";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MarketPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full",
        "bg-background" // Using theme-aware background color
      )}
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Market Activity Overview
        </h1>
        <p className="text-muted-foreground">
          Real-time tracking of significant market transactions
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <MarketActivity />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-8 w-[300px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-lg border shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-2 space-y-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="h-[1px] w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
