import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";
import { TimeFrameSelector } from "@/components/ui/time-frame-selector";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";

interface MarketData {
  Symbol: string;
  SecurityName: string;
  TotalBuyVolume: string;
  TotalSellVolume: string;
  AvgBuyPrice: string;
  AvgSellPrice: string;
  TopBuyers: Trader[];
  TopSellers: Trader[];
  BuySellImbalance: string;
  ImbalanceType: string;
  PriceAnomalies: any[];
  PriceTrend: string;
  PotentialProfitableTrade: boolean;
}

interface Trader {
  BD_CLIENT_NAME: string;
  BD_TP_WATP: number;
  BD_DT_DATE: string;
  BD_REMARKS: string;
}

const BulkBlockTradeInsights = () => {
  const [tradeType, setTradeType] = useState<"bulk" | "block">("block");
  const [timeFrame, setTimeFrame] = useState("today");
  const [insights, setInsights] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.bulkDeals.getDetails(
        timeFrame,
        `${tradeType}_data`
      );
      setInsights(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [timeFrame, tradeType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          {tradeType === "block"
            ? "Block Trade Insights"
            : "Bulk Deal Insights"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={tradeType === "block" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTradeType("block")}
              className="rounded-md"
            >
              Block Trades
            </Button>
            <Button
              variant={tradeType === "bulk" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTradeType("bulk")}
              className="rounded-md"
            >
              Bulk Deals
            </Button>
          </div>

          <TimeFrameSelector value={timeFrame} onChange={setTimeFrame} />
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={loadTrades} />
      ) : insights.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {insights.map((item) => (
            <InsightCard key={item.Symbol} data={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const InsightCard = ({ data }: { data: MarketData }) => {
  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "bearish":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{data.Symbol}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {data.SecurityName}
            </p>
          </div>
          <Badge className={cn(getTrendColor(data.PriceTrend), "ml-2")}>
            {data.PriceTrend}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Buy</p>
            <p className="text-lg font-semibold">
              ₹{parseFloat(data.AvgBuyPrice).toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Sell</p>
            <p className="text-lg font-semibold">
              ₹{parseFloat(data.AvgSellPrice || "0").toFixed(2)}
            </p>
          </div>
        </div>

        <TraderSection title="Top Buyers" traders={data.TopBuyers} />
        <TraderSection title="Top Sellers" traders={data.TopSellers} />
      </div>
    </Card>
  );
};

const TraderSection = ({
  title,
  traders,
}: {
  title: string;
  traders: Trader[];
}) => (
  <div>
    <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
    <div className="space-y-2">
      {traders.map((trader, index) => (
        <div
          key={index}
          className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{trader.BD_CLIENT_NAME}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(trader.BD_DT_DATE).toLocaleDateString("en-IN")}
              </p>
            </div>
            <Badge variant="outline" className="ml-2">
              ₹{trader.BD_TP_WATP.toFixed(2)}
            </Badge>
          </div>
          {trader.BD_REMARKS && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {trader.BD_REMARKS}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const LoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[120px] w-full" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <Alert variant="destructive">{error}</Alert>
    <Button onClick={onRetry} variant="outline">
      Retry
    </Button>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <div className="text-center space-y-2">
      <p className="text-muted-foreground">No trade insights found</p>
      <p className="text-sm text-muted-foreground">
        Try adjusting the time frame or trade type
      </p>
    </div>
  </div>
);

export default BulkBlockTradeInsights;

