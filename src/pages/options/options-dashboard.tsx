import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/./hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/api/services/api.service";
import OptionsDashboard from "@/components/options/OptionDashboard";

export default function OptionsPage() {
  const [initialData, setInitialData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiService.socket.getRecentOptionAnalytics();

      if (!res?.data) {
        throw new Error("Invalid data format received from server");
      }

      setInitialData(res.data);
    } catch (err) {
      console.error("Error fetching option analytics:", err);
      toast({
        title: "Data Load Error",
        description:
          err instanceof Error ? err.message : "Failed to load options data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        await fetchData();
      } catch (err) {
        if (isMounted) {
          toast({
            title: "Connection Error",
            description: "Failed to initialize data connection",
            variant: "destructive",
          });
        }
      }
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchData, toast]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Market Summary Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Market Health Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>

        {/* PCR Analysis Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-[300px]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Signals Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 text-center">
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-100">
            Data Load Failed
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Unable to load options data. Please check your connection and try
            again.
          </p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            aria-label="Retry data load"
          >
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  return <OptionsDashboard initialData={initialData} />;
}

