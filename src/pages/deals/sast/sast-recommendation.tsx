import { Suspense } from "react";
import CompactRecommendations from "@/components/reports/sastTrades/SastRecommendation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function RecommendationsPage() {
  return (
    <main
      className={cn(
        "flex-1 flex flex-col",
        "p-4 sm:p-6 lg:p-8",
        "max-w-7xl mx-auto w-full"
      )}
    >
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Expert Investment Recommendations
        </h1>
        <p className="text-muted-foreground">
          Data-driven insights based on recent market activities
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <CompactRecommendations />
      </Suspense>
    </main>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-lg border shadow-sm overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
