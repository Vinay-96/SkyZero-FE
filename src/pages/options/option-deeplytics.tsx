import { useEffect, useState, useCallback } from "react";
import { apiService } from "@/lib/api/services/api.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/./hooks/use-toast";
// import type { DashboardData } from "@/components/options/OptionDeepAnalysis";
import { DeepOptionsDashboard } from "@/components/options/OptionDeepAnlaysis";


export default function OptionsDeepPage() {
  const [initialData, setInitialData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiService.socket.getRecentOptionDeeplytics();

      if (!res?.data) {
        throw new Error("Invalid data format received");
      }

      setInitialData(res.data);
    } catch (err) {
      console.error("Error fetching option analytics:", err);
      toast({
        title: "Data Load Error",
        description:
          "Failed to load initial options data. " +
          (err instanceof Error ? err.message : "Please try again later."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;

    const loadData = async () => {
      // Add slight delay to prevent flash of loading state
      loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, 100);

      await fetchData();
      clearTimeout(loadingTimeout);
    };

    loadData();

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-[250px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
              ))}
          </div>
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
          >
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  return <DeepOptionsDashboard initialData={initialData} />;
}

