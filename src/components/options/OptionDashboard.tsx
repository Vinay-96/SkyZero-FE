import { useEffect, useState, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Signal,
  Scale,
  BarChart2,
  BarChart,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "../../hooks/use-toast";
import { socketService } from "@/lib/socket";
import { useAuthStore } from "@/lib/zustand/store";

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
  breakeven: number;
  timeExits: {
    maxHoldingPeriod: string;
  };
}

interface Confidence {
  score: number;
  level: string;
  explanation: string;
}

interface SignalData {
  strikePrice: number;
  underlyingPrice: number;
  optionData: {
    marketData: MarketData;
    greeks: Greeks;
  };
  tradeSetup: TradeSetup;
  confidence: Confidence;
  timestamp: string;
}

interface PCRAnalysis {
  pcr: number;
  skew: number;
  intensity: number;
  strength: {
    value: string;
    trend: string;
  };
  contrarian: {
    confidence: Confidence;
    sentiment: {
      direction: string;
      strength: string;
    };
  };
  bias: "bullish" | "bearish";
}

interface MarketConditions {
  trend: string;
  volatility: number;
  volatilityHistory: Array<{ date: string; value: number }>;
  pcrAnalysis: PCRAnalysis;
}

interface DashboardData {
  timestamp: string;
  callSignals: SignalData[];
  putSignals: SignalData[];
  marketConditions: MarketConditions;
  summary: {
    marketBias: {
      confidence: number;
    };
    dataPCRratio: string;
    confidence: string;
    bestOpportunity: string;
    riskWarning: string;
  };
}

interface OptionsDashboardProps {
  initialData: DashboardData;
}

const getConfidenceColor = (score: number) => {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const formatIV = (iv: number) => `${iv.toFixed(1)}%`;
const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

const MetricItem = memo(
  ({
    label,
    value,
    icon,
    chart,
    trend,
    direction,
  }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    chart?: React.ReactNode;
    trend?: string;
    direction?: "positive" | "negative";
  }) => (
    <div
      className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow dark:bg-gray-700 dark:hover:shadow-lg dark:hover:shadow-gray-900"
      role="region"
      aria-label={label}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-600">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div
            className={`text-lg font-semibold ${
              direction === "negative"
                ? "text-red-600 dark:text-red-400"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {value}
          </div>
        </div>
      </div>
      {chart && <div className="ml-auto">{chart}</div>}
      {trend && (
        <Badge
          variant={trend === "rising" ? "success" : "destructive"}
          className="ml-2"
        >
          {trend}
        </Badge>
      )}
    </div>
  )
);

const SignalCard = memo(
  ({ signal, type }: { signal: SignalData; type: "call" | "put" }) => {
    const [expanded, setExpanded] = useState(false);
    const isCall = type === "call";
    const confidenceScore = parseFloat(signal.confidence.score);

    return (
      <Card
        className="p-3 hover:bg-muted/50 transition-colors cursor-pointer group dark:bg-gray-700 dark:hover:bg-gray-600/50"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isCall ? "success" : "destructive"}>
              {signal.tradeSetup.action}
            </Badge>
            <span className="font-medium dark:text-gray-200">
              {signal.strikePrice}
            </span>
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              LTP: {formatPrice(signal.optionData.marketData.ltp)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn("text-sm", getConfidenceColor(confidenceScore))}
            >
              {confidenceScore}%
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform group-hover:text-primary dark:text-gray-400",
                expanded && "rotate-180"
              )}
            />
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-2" aria-live="polite">
            <div className="grid grid-cols-2 gap-2 text-sm dark:text-gray-300">
              {[
                ["Delta", signal.optionData.greeks.delta.toFixed(2)],
                ["IV", formatIV(signal.optionData.greeks.iv)],
                [
                  "Volume",
                  signal.optionData.marketData.volume.toLocaleString(),
                ],
                ["OI", signal.optionData.marketData.oi.toLocaleString()],
                ["Score", signal.confidence.score],
                ["Level", signal.confidence.level],
              ].map(([label, value], index) => (
                <div key={index}>
                  <span className="text-muted-foreground dark:text-gray-400">
                    {label}:{" "}
                  </span>
                  {value}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground dark:text-gray-400">
                Explanation:
              </div>
              <div className="text-primary dark:text-blue-400">
                {signal.confidence.explanation}
              </div>
            </div>
            <div className="text-sm dark:text-gray-300">
              {[
                ["Target", signal.tradeSetup.targetPrice],
                ["SL", signal.tradeSetup.stopLoss],
                ["Breakeven", signal.tradeSetup.breakeven],
              ].map(([label, value], index) => (
                <span key={label}>
                  <span className="text-muted-foreground dark:text-gray-400">
                    {label}:{" "}
                  </span>
                  {formatPrice(value)}
                  {index < 2 && " | "}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }
);

const OptionsDashboard = ({ initialData }: OptionsDashboardProps) => {
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
      "high-profit-trades",
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 dark:bg-gray-900">
        <Skeleton className="h-8 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

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

      {/* Market Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Market Pulse
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  data.marketConditions.trend.includes("uptrend")
                    ? "success"
                    : "destructive"
                }
              >
                {data.marketConditions.trend.replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Strength: {data.summary.marketBias.confidence} | PCR Bias:{" "}
                <span
                  className={
                    data.marketConditions.pcrAnalysis.bias === "bullish"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {data.marketConditions.pcrAnalysis.bias}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <span className="text-sm text-muted-foreground">
              Last Updated:{" "}
              {new Date(data.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <MetricItem
            label="Market Trend"
            value={`${(data.summary.marketBias.confidence).toFixed(
              1
            )}% Confidence`}
            icon={<Activity className="h-4 w-4" />}
          />

          <MetricItem
            label="Data PCR"
            value={data.summary.dataPCRratio}
            icon={<Zap className="h-4 w-4 text-yellow-500" />}
          />

          <MetricItem
            label="PCR Ratio"
            value={data.marketConditions.pcrAnalysis.pcr.toFixed(2)}
            icon={<Scale className="h-4 w-4 text-purple-500" />}
          />

          <MetricItem
            label="Best Opportunity"
            value={`Confidence ${data.summary.confidence} - ${data.summary.bestOpportunity}`}
            icon={<Signal className="h-4 w-4 text-green-500" />}
          />
        </div>
      </Card>

      {/* Market Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Market Health
            </h2>
          </div>
          <div className="space-y-4">
            <MetricItem
              label="Volatility Trend"
              value={`${data.marketConditions.volatility.toFixed(2)}%`}
              icon={<Zap className="h-5 w-5 text-yellow-500" />}
              chart={
                <ResponsiveContainer width={100} height={40}>
                  <LineChart
                    data={data.marketConditions.volatilityHistory}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  >
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              }
            />
            <MetricItem
              label="Risk Level"
              value={data.summary.riskWarning}
              icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
              direction="negative"
            />
            <MetricItem
              label="Market Momentum"
              value={data.marketConditions.pcrAnalysis.strength.value}
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              trend={data.marketConditions.pcrAnalysis.strength.trend}
            />
          </div>
        </Card>

        {/* Call Signals Card */}
        <Card className="p-5 bg-gradient-to-b from-green-50 to-white border border-green-100 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Call Opportunities
            </h2>
            <Badge variant="success" className="ml-auto">
              {data.callSignals.length} signals
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Avg Premium
              </span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                {formatPrice(
                  data.callSignals.reduce(
                    (acc, s) => acc + s.optionData.marketData.ltp,
                    0
                  ) / data.callSignals.length
                )}
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Volume Trend
              </span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-green-100 rounded-full overflow-hidden dark:bg-green-900/50">
                  <div
                    className="h-full bg-green-500 dark:bg-green-400"
                    style={{
                      width: `${data.marketConditions.pcrAnalysis.volumeTrend.callPercentage}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-green-700 dark:text-green-400">
                  {data.marketConditions.pcrAnalysis.volumeTrend.callPercentage}
                  %
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={data.callSignals.slice(0, 3).map((s) => ({
                    name: s.strikePrice,
                    value: parseFloat(s.confidence.score),
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.callSignals.slice(0, 3).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#10b981", "#059669", "#047857"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#f3f4f6" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Put Signals Card */}
        <Card className="p-5 bg-gradient-to-b from-red-50 to-white border border-red-100 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Put Opportunities
            </h2>
            <Badge variant="destructive" className="ml-auto">
              {data.putSignals.length} signals
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Avg Premium
              </span>
              <span className="font-semibold text-red-700 dark:text-red-400">
                {formatPrice(
                  data.putSignals.reduce(
                    (acc, s) => acc + s.optionData.marketData.ltp,
                    0
                  ) / data.putSignals.length
                )}
              </span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Volume Trend
              </span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-red-100 rounded-full overflow-hidden dark:bg-red-900/50">
                  <div
                    className="h-full bg-red-500 dark:bg-red-400"
                    style={{
                      width: `${data.marketConditions.pcrAnalysis.volumeTrend.putPercentage}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-red-700 dark:text-red-400">
                  {data.marketConditions.pcrAnalysis.volumeTrend.putPercentage}%
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={data.putSignals.slice(0, 3).map((s) => ({
                    name: s.strikePrice,
                    value: parseFloat(s.confidence.score),
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.putSignals.slice(0, 3).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#ef4444", "#dc2626", "#b91c1c"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#f3f4f6" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* PCR Analysis Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            PCR Deep Analysis
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PCR Metrics */}
          <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Scale className="h-4 w-4" /> PCR Metrics
            </h3>
            <div className="space-y-3">
              {[
                [
                  "Current PCR",
                  data.marketConditions.pcrAnalysis.pcr.toFixed(2),
                ],
                [
                  "Skew Index",
                  data.marketConditions.pcrAnalysis.skew.toFixed(2),
                ],
                [
                  "Market Intensity",
                  data.marketConditions.pcrAnalysis.intensity.toFixed(2),
                ],
              ].map(([label, value], index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {label}
                  </span>
                  <span className="font-semibold dark:text-gray-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Strength Analysis */}
          <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Strength Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">
                    Strength Score
                  </span>
                  <span className="font-semibold dark:text-gray-200">
                    {data.marketConditions.pcrAnalysis.strength.value}
                  </span>
                </div>
                <Progress
                  value={
                    parseFloat(
                      data.marketConditions.pcrAnalysis.strength.value
                    ) * 10
                  }
                  className="h-2 bg-gray-100 dark:bg-gray-700"
                  indicatorClassName="bg-blue-500 dark:bg-blue-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {data.marketConditions.pcrAnalysis.strength.trend} Trend
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {
                    data.marketConditions.pcrAnalysis.contrarian.sentiment
                      .strength
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Contrarian Signals */}
          <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> Contrarian Signals
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {
                    data.marketConditions.pcrAnalysis.contrarian.sentiment
                      .direction
                  }
                </span>{" "}
                bias with{" "}
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {
                    data.marketConditions.pcrAnalysis.contrarian.sentiment
                      .strength
                  }
                </span>{" "}
                pressure -{" "}
                <span className="font-medium text-teal-600 dark:text-teal-400">
                  {
                    data.marketConditions.pcrAnalysis.contrarian.sentiment
                      .reasoning
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold dark:text-gray-200">
              Top Call Opportunities
            </h3>
          </div>
          <div className="space-y-3">
            {data.callSignals.slice(0, 10).map((signal, i) => (
              <SignalCard key={i} signal={signal} type="call" />
            ))}
          </div>
        </Card>

        <Card className="p-4 dark:bg-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold dark:text-gray-200">
              Top Put Opportunities
            </h3>
          </div>
          <div className="space-y-3">
            {data.putSignals.slice(0, 10).map((signal, i) => (
              <SignalCard key={i} signal={signal} type="put" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OptionsDashboard;

