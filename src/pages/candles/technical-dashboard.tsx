"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarketAnalysisDashboard from "@/components/candles/CandleDashboard";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/lib/zustand/store";
import { apiService } from "@/lib/api/services/api.service";

interface AnalysisData {
  intraday: any;
  historical: any;
}

export default function AnalysisPage() {
  const [timeframe, setTimeframe] = useState<"1m" | "30m">("1m");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [intradayRes, historicRes] = await Promise.all([
          timeframe === "1m"
            ? apiService.socket.getIntraday1mCandle()
            : apiService.socket.getIntraday30mCandle(),
          timeframe === "1m"
            ? apiService.socket.getHistorical1mCandle()
            : apiService.socket.getHistorical30mCandle(),
        ]);

        if (!intradayRes?.data || !historicRes?.data) {
          throw new Error("Failed to fetch analysis data");
        }

        setAnalysisData({
          intraday: intradayRes.data,
          historical: historicRes.data,
        });
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

    let intradayEvent: string;
    let historicalEvent: string;
    let handleIntradayData: (data: any) => void;
    let handleHistoricalData: (data: any) => void;

    const connectSocket = async () => {
      try {
        await socketService.connect(token);

        // Determine events based on timeframe
        intradayEvent =
          timeframe === "1m"
            ? "intraday-candle-analysis"
            : "intraday-candle-analysis-30";

        historicalEvent =
          timeframe === "1m"
            ? "historical-candle-analysis"
            : "historical-candle-analysis-30";

        // Setup handlers
        handleIntradayData = (newData: any) => {
          setAnalysisData((prev) => ({
            ...(prev || { intraday: null, historical: null }),
            intraday: newData,
          }));
        };

        handleHistoricalData = (newData: any) => {
          setAnalysisData((prev) => ({
            ...(prev || { intraday: null, historical: null }),
            historical: newData,
          }));
        };

        // Subscribe to events
        socketService.subscribe(intradayEvent, handleIntradayData);
        socketService.subscribe(historicalEvent, handleHistoricalData);
      } catch (err) {
        console.error("Socket connection error:", err);
      }
    };

    connectSocket();

    return () => {
      // Cleanup subscriptions
      if (intradayEvent && handleIntradayData) {
        socketService.unsubscribe(intradayEvent, handleIntradayData);
      }
      if (historicalEvent && handleHistoricalData) {
        socketService.unsubscribe(historicalEvent, handleHistoricalData);
      }
      socketService.disconnect();
    };
  }, [token, timeframe]);

  const handleTimeframeChange = (newTimeframe: "1m" | "30m") => {
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
            variant={timeframe === "30m" ? "default" : "outline"}
            onClick={() => handleTimeframeChange("30m")}
          >
            30 Minute Analysis
          </Button>
        </div>

        <MarketAnalysisDashboard data={analysisData} />
      </div>
    </div>
  );
}

