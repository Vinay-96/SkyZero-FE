import { Suspense } from "react";
import CompanyInsightsDashboard from "@/components/reports/sastTrades/SastTransactionAnalysis";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full",
        "bg-background text-foreground"
      )}
    >
      <div className="space-y-1 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Corporate Transaction Intelligence
        </h1>
        <p className="text-muted-foreground">
          Comprehensive analysis of significant market movements and ownership
          changes
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <CompanyInsightsDashboard />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="rounded-lg border shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="p-6 pt-0 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    ))}
  </div>
);
