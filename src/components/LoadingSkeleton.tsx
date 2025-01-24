// components/LoadingSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 w-full max-w-md p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

