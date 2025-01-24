import { Suspense } from "react";
import MarketSignals from "@/components/reports/insiderTrades/InsiderInsights";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export default function SignalsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full"
      )}
    >
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Market Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time analysis of insider trading signals and market movements
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <MarketSignals />
      </Suspense>

      <Toaster />
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-8">
    {[1, 2].map((_, index) => (
      <div key={index} className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);
