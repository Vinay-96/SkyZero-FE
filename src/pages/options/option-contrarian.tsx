// pages/signals.tsx
"use client";

import { useState, useEffect } from "react";
import { socketService } from "@/lib/socket";
import SignalsUI, {
  AnalysisData,
} from "@/components/options/OptionContrarianSignals";
import { useAuthStore } from "@/lib/zustand/store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/api/services/api.service";

export default function SignalsPage() {
  // Replace or adjust these as needed.
  const { token } = useAuthStore(); // Get token from your auth hook
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await apiService.socket.getRecentOptionContrarianSignals();

        if (!res?.data) {
          throw new Error("Failed to fetch analysis data");
        }

        // Assume the API returns an object matching AnalysisData
        setAnalysisData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [token]);

  // --- WebSocket Connection and Data Handling ---
  useEffect(() => {
    if (!token) return;
    let currentEvent: string;
    let handler: ((data: any) => void) | null = null;

    const connectSocket = async () => {
      try {
        await socketService.connect(token);
        currentEvent = "strong-contrarian-signals";

        handler = (newData: any) => {
          // Assume the socket sends an object matching AnalysisData
          setAnalysisData(newData.data);
        };

        socketService.subscribe("strong-contrarian-signals", handler);
      } catch (err) {
        console.error("Socket connection error:", err);
      }
    };

    connectSocket();

    return () => {
      if (handler && currentEvent) {
        socketService.unsubscribe(currentEvent, handler);
      }
      socketService.disconnect();
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center p-4">
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <SignalsUI data={analysisData} />;
}

