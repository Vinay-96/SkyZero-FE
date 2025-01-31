"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarketAnalysisDashboard from "@/components/candles/CandleDashboard";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/lib/zustand/store";
import { apiService } from "@/lib/api/services/api.service";

interface AnalysisData {
  historical: any;
}

// API method mapping
const TIMEFRAME_API_METHODS = {
  "1m": apiService.socket.getHistorical1mCandle,
  "5m": apiService.socket.getHistorical5mCandle,
  "10m": apiService.socket.getHistorical10mCandle,
  "15m": apiService.socket.getHistorical15mCandle,
  "30m": apiService.socket.getHistorical30mCandle,
  "60m": apiService.socket.getHistorical60mCandle,
};

// Socket event mapping
const TIMEFRAME_SOCKET_EVENTS = {
  "1m": "historical-candle-analysis-1m",
  "5m": "historical-candle-analysis-5m",
  "10m": "historical-candle-analysis-10m",
  "15m": "historical-candle-analysis-15m",
  "30m": "historical-candle-analysis-30m",
  "60m": "historical-candle-analysis-60m",
};

export default function AnalysisPage() {
  const [timeframe, setTimeframe] = useState<
    "1m" | "5m" | "10m" | "15m" | "30m" | "60m"
  >("1m");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const apiMethod = TIMEFRAME_API_METHODS[timeframe];
        const historicRes = await apiMethod();

        if (!historicRes?.data) {
          throw new Error("Failed to fetch analysis data");
        }

        setAnalysisData({ historical: historicRes.data });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [timeframe]);

  // Socket connection and data handling
  useEffect(() => {
    if (!token) return;

    let currentEvent: string;
    let handler: ((data: any) => void) | null = null;

    const connectSocket = async () => {
      try {
        await socketService.connect(token);

        currentEvent = TIMEFRAME_SOCKET_EVENTS[timeframe];
        handler = (newData: any) => {
          setAnalysisData((prev) => ({
            ...(prev || { historical: null }),
            historical: newData,
          }));
        };

        socketService.subscribe(currentEvent, handler);
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
  }, [token, timeframe]);

  const handleTimeframeChange = (
    newTimeframe: "1m" | "5m" | "10m" | "15m" | "30m" | "60m"
  ) => {
    if (newTimeframe !== timeframe) {
      setIsLoading(true);
      setTimeframe(newTimeframe);
    }
  };

  if (error) {
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

  if (isLoading || !analysisData) {
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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex gap-2">
          <Button
            variant={timeframe === "1m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("1m")}
          >
            1 Minute Analysis
          </Button>
          <Button
            variant={timeframe === "5m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("5m")}
          >
            5 Minute Analysis
          </Button>
          <Button
            variant={timeframe === "10m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("10m")}
          >
            10 Minute Analysis
          </Button>
          <Button
            variant={timeframe === "15m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("15m")}
          >
            15 Minute Analysis
          </Button>
          <Button
            variant={timeframe === "30m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("30m")}
          >
            30 Minute Analysis
          </Button>
          <Button
            variant={timeframe === "60m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("60m")}
          >
            60 Minute Analysis
          </Button>
        </div>

        <MarketAnalysisDashboard data={analysisData} />
      </div>
    </div>
  );
}

