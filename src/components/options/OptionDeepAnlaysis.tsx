import { useState, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  ArrowDown,
  Sigma,
  Clock,
  AlertCircle,
  Zap,
  Scale,
  TrendingUp,
  TrendingDown,
  BarChart,
  Circle,
} from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useAuthStore } from "@/lib/zustand/store";
import { socketService } from "@/lib/socket";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../../../src/hooks/use-toast";

// Type definitions
interface Greeks {
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

interface MarketData {
  ltp: number;
  volume: number;
  oi: number;
  lastUpdated: string;
}

interface TradeSetup {
  action: string;
  targetPrice: number;
  stopLoss: number;
  timeExits: {
    maxHoldingPeriod: string;
  };
}

interface Confidence {
  score: number;
  level: string;
}

interface OptionData {
  strikePrice: number;
  underlyingPrice: number;
  optionData: {
    marketData: MarketData;
    greeks: Greeks;
  };
  tradeSetup: TradeSetup;
  confidence: Confidence;
  enhancedScore?: number;
  timestamp: string;
  type: "CALL" | "PUT";
}

interface MarketBias {
  direction: "CALL" | "PUT";
  strength: string;
  pcrBias: string;
}

interface DashboardData {
  calls: OptionData[];
  puts: OptionData[];
  highProbabilitySetups: OptionData[];
  marketBias: MarketBias;
}

// Sub-component for confidence display
const ConfidenceBadge = ({
  score,
  level,
}: {
  score: number;
  level: string;
}) => (
  <div className="flex flex-col items-end space-y-2">
    <div
      className={cn(
        "text-xl font-bold transition-colors",
        score >= 70
          ? "text-green-500"
          : score >= 40
          ? "text-yellow-500"
          : "text-red-500"
      )}
    >
      {score}%
    </div>
    <Badge
      variant="outline"
      className="text-xs aria-[current=true]:ring-2"
      aria-current={level === "HIGH" ? "true" : "false"}
    >
      {level} Confidence
    </Badge>
  </div>
);

// Sub-component for progress displays
const GreeksProgressBar = ({
  label,
  value,
  indicatorClass,
  formattedValue,
}: {
  label: string;
  value: number;
  indicatorClass: string;
  formattedValue: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium dark:text-gray-300">{formattedValue}</span>
    </div>
    <Progress
      value={Math.abs(value) * 100}
      className="h-2"
      indicatorClassName={indicatorClass}
    />
  </div>
);

// Memoized OptionCard to prevent unnecessary re-renders
const OptionCard = memo(
  ({ option, type }: { option: OptionData; type: "call" | "put" }) => {
    const isCall = type === "call";
    const confidenceScore = Number(option.confidence.score);
    const marketData = option.optionData.marketData;
    const greeks = option.optionData.greeks;

    return (
      <Card
        className="p-4 hover:bg-muted/50 transition-colors dark:bg-gray-800 group"
        role="article"
        aria-labelledby={`option-${option.strikePrice}-label`}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div
              className="flex items-center gap-2"
              id={`option-${option.strikePrice}-label`}
            >
              <Badge
                variant={isCall ? "default" : "destructive"}
                className="px-2 py-1 aria-label"
                aria-label={`Option type: ${option.tradeSetup.action}`}
              >
                {option.tradeSetup.action}
              </Badge>
              <span className="font-mono font-bold text-lg dark:text-gray-200">
                {option.strikePrice}
              </span>
              <Circle className="h-2 w-2 text-muted-foreground" aria-hidden />
              <span className="text-sm text-muted-foreground">
                Underlying: ₹{option.underlyingPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" aria-hidden />
                <span className="font-semibold dark:text-gray-300">
                  ₹{marketData.ltp.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground ml-2">LTP</span>
              </div>

              <div className="flex items-center gap-1">
                <Sigma className="h-4 w-4 text-purple-500" aria-hidden />
                <span className="font-semibold dark:text-gray-300">
                  {greeks.iv.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground ml-2">IV</span>
              </div>
            </div>
          </div>

          <ConfidenceBadge
            score={confidenceScore}
            level={option.confidence.level}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <GreeksProgressBar
            label="Delta"
            value={greeks.delta}
            indicatorClass={isCall ? "bg-green-500" : "bg-red-500"}
            formattedValue={Math.abs(greeks.delta).toFixed(3)}
          />

          <GreeksProgressBar
            label="Volume/OI"
            value={marketData.volume / marketData.oi}
            indicatorClass="bg-blue-500"
            formattedValue={`${marketData.volume.toLocaleString()}/${marketData.oi.toLocaleString()}`}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ArrowUp className="h-4 w-4 text-green-500" aria-hidden />
              <span>Target</span>
            </div>
            <div className="font-medium dark:text-gray-300">
              ₹{option.tradeSetup.targetPrice.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-red-500" aria-hidden />
              <span>Stop Loss</span>
            </div>
            <div className="font-medium dark:text-gray-300">
              ₹{option.tradeSetup.stopLoss.toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-500" aria-hidden />
              <span>Hold Time</span>
            </div>
            <div className="font-medium dark:text-gray-300">
              {option.tradeSetup.timeExits.maxHoldingPeriod}
            </div>
          </div>
        </div>

        {option.enhancedScore && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Enhanced Score</span>
            <Progress
              value={option.enhancedScore}
              className="w-24 h-2 bg-gray-100 dark:bg-gray-700"
              className="bg-purple-500"
            />
            <span className="font-medium text-purple-500 dark:text-purple-400">
              {option.enhancedScore.toFixed(1)}
            </span>
          </div>
        )}
      </Card>
    );
  }
);

// Skeleton loader for cards
const CardSkeleton = () => (
  <Card className="p-4 dark:bg-gray-800">
    <Skeleton className="h-6 w-1/2 mb-4" />
    <div className="flex justify-between mb-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-3/4" />
    </div>
  </Card>
);

export const DeepOptionsDashboard = ({
  initialData,
}: {
  initialData: DashboardData;
}) => {
  const [data, setData] = useState<DashboardData>(initialData);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >(socketService.isConnected ? "connected" : "connecting");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const token = useAuthStore.getState().token;

  const handleSocketUpdate = useCallback((newData: DashboardData) => {
    setData(newData.data);
    setIsLoading(false);
  }, []);

  const handleSocketError = useCallback(
    (error: Error) => {
      console.error("Socket error:", error);
      setConnectionStatus("disconnected");
      toast({
        title: "Connection Error",
        description: "Failed to maintain real-time connection",
        variant: "destructive",
      });
    },
    [toast]
  );

  useEffect(() => {
    const connectSocket = async () => {
      try {
        setIsLoading(true);
        setConnectionStatus("connecting");
        await socketService.connect(token);
        setConnectionStatus("connected");
      } catch (error) {
        handleSocketError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!socketService.isConnected) {
      connectSocket();
    }

    const unsubscribeUpdate = socketService.subscribe(
      "strong-signals",
      handleSocketUpdate
    );
    const unsubscribeConnect = socketService.subscribe("connect", () => {
      setConnectionStatus("connected");
      setIsLoading(false);
    });

    const unsubscribeDisconnect = socketService.subscribe("disconnect", () => {
      setConnectionStatus("disconnected");
      setIsLoading(true);
    });

    const unsubscribeError = socketService.subscribe(
      "error",
      handleSocketError
    );

    return () => {
      unsubscribeUpdate();
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
    };
  }, [token, handleSocketUpdate, handleSocketError]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 dark:bg-gray-900 min-h-screen">
      {/* Connection Status */}
      <div aria-live="polite" className="sr-only">
        Connection status: {connectionStatus}
      </div>
      {connectionStatus !== "connected" && (
        <div
          role="alert"
          className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded text-center text-sm animate-pulse"
        >
          {connectionStatus === "disconnected"
            ? "Reconnecting to real-time updates..."
            : "Establishing connection..."}
        </div>
      )}

      {/* Market Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold dark:text-gray-200">
              Market Overview
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  data.marketBias.direction === "CALL"
                    ? "success"
                    : "destructive"
                }
                aria-label="Market bias direction"
              >
                {data.marketBias.direction} BIAS
              </Badge>
              <span className="text-sm text-muted-foreground">
                Strength: {data.marketBias.strength} | PCR Bias:{" "}
                <span
                  className={
                    data.marketBias.pcrBias.toLowerCase() === "bullish"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {data.marketBias.pcrBias}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart
              className="h-6 w-6 text-blue-500 dark:text-blue-400"
              aria-hidden
            />
            <span className="text-sm text-muted-foreground">
              Last Updated:{" "}
              {new Date(data.calls[0].timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* High Probability Setups */}
      <section aria-labelledby="high-probability-section">
        <h3
          id="high-probability-section"
          className="text-lg font-semibold dark:text-gray-200 flex items-center gap-2"
        >
          <Zap className="h-5 w-5 text-yellow-500" aria-hidden />
          High Probability Setups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {data.highProbabilitySetups.map((setup, i) => (
            <OptionCard
              key={`${setup.strikePrice}-${i}`}
              option={setup}
              type={setup.type === "CALL" ? "call" : "put"}
            />
          ))}
        </div>
      </section>

      {/* Calls Section */}
      <section aria-labelledby="calls-section">
        <h3
          id="calls-section"
          className="text-lg font-semibold dark:text-gray-200 flex items-center gap-2"
        >
          <TrendingUp className="h-5 w-5 text-green-500" aria-hidden />
          Call Opportunities ({data.calls.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {data.calls.map((call, i) => (
            <OptionCard
              key={`${call.strikePrice}-${i}`}
              option={call}
              type="call"
            />
          ))}
        </div>
      </section>

      {/* Puts Section */}
      <section aria-labelledby="puts-section">
        <h3
          id="puts-section"
          className="text-lg font-semibold dark:text-gray-200 flex items-center gap-2"
        >
          <TrendingDown className="h-5 w-5 text-red-500" aria-hidden />
          Put Opportunities ({data.puts.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {data.puts.map((put, i) => (
            <OptionCard
              key={`${put.strikePrice}-${i}`}
              option={put}
              type="put"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

