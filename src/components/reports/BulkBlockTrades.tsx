import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";
import { Button } from "../ui/button";
import { TimeFrameSelector } from "../ui/time-frame-selector";

interface TradeData {
  Symbol: string;
  SecurityName: string;
  Trades: {
    BUY: Trade[];
    SELL: Trade[];
  };
}

interface Trade {
  _id: string;
  BD_CLIENT_NAME: string;
  BD_TP_WATP: number;
  mTIMESTAMP: string;
  attachement?: string;
}

const BulkBlockTrades = () => {
  const [tradeType, setTradeType] = useState<"bulk" | "block">("bulk");
  const [timeFrame, setTimeFrame] = useState("oneWeek");
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response =
        tradeType === "block"
          ? await apiService.blockDeals.getAll(timeFrame, `${tradeType}_data`)
          : await apiService.bulkDeals.getAll(timeFrame, `${tradeType}_data`);
      setTrades(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [tradeType, timeFrame]);

  if (loading) return <LoadingState tradeType={tradeType} />;
  if (error) return <ErrorState error={error} onRetry={loadTrades} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">
          {tradeType === "block" ? "Block Trades" : "Bulk Deals"}
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
        <LoadingState tradeType={tradeType} />
      ) : error ? (
        <ErrorState error={error} onRetry={loadTrades} />
      ) : (
        <div className="space-y-4">
          {trades.map((tradeData) => (
            <TradeCard
              key={tradeData.Symbol}
              data={tradeData}
              tradeType={tradeType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TradeCardProps {
  data: TradeData;
  tradeType: "bulk" | "block";
}

const TradeCard = ({ data, tradeType }: TradeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasBuyTrades = data.Trades.BUY.length > 0;
  const hasSellTrades = data.Trades.SELL.length > 0;

  const avgBuyPrice = hasBuyTrades
    ? data.Trades.BUY.reduce((acc, trade) => acc + trade.BD_TP_WATP, 0) /
      data.Trades.BUY.length
    : 0;
  const avgSellPrice = hasSellTrades
    ? data.Trades.SELL.reduce((acc, trade) => acc + trade.BD_TP_WATP, 0) /
      data.Trades.SELL.length
    : 0;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-semibold">{data.Symbol}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {data.SecurityName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-4">
                <Badge variant="success" className="gap-1">
                  <ArrowUpRight className="h-4 w-4" />
                  {data.Trades.BUY.length} Buys
                </Badge>
                <Badge variant="destructive" className="gap-1">
                  <ArrowDownRight className="h-4 w-4" />
                  {data.Trades.SELL.length} Sells
                </Badge>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  isExpanded && "rotate-180"
                )}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {hasBuyTrades && (
                <div className="flex items-center gap-2 p-3 bg-muted/25 rounded-lg flex-1">
                  <ArrowUpRight className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Buy Price
                    </p>
                    <p className="font-semibold">₹{avgBuyPrice.toFixed(2)}</p>
                  </div>
                </div>
              )}
              {hasSellTrades && (
                <div className="flex items-center gap-2 p-3 bg-muted/25 rounded-lg flex-1">
                  <ArrowDownRight className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Sell Price
                    </p>
                    <p className="font-semibold">₹{avgSellPrice.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            <TradeDetails
              trades={data.Trades.BUY}
              type="BUY"
              tradeType={tradeType}
            />
            <TradeDetails
              trades={data.Trades.SELL}
              type="SELL"
              tradeType={tradeType}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface TradeDetailsProps {
  trades: Trade[];
  type: "BUY" | "SELL";
  tradeType: "bulk" | "block";
}

const TradeDetails = ({ trades, type, tradeType }: TradeDetailsProps) => {
  if (trades.length === 0) return null;

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-sm font-semibold mb-2">{type} Transactions</h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Client</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Date</TableHead>
              {tradeType === "block" && (
                <TableHead className="text-right">Document</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade._id}>
                <TableCell className="font-medium">
                  {trade.BD_CLIENT_NAME}
                </TableCell>
                <TableCell className="text-right">
                  ₹{trade.BD_TP_WATP.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {new Date(trade.mTIMESTAMP).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                {tradeType === "block" && (
                  <TableCell className="text-right">
                    {trade.attachement ? (
                      <a
                        href={trade.attachement}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex gap-1 justify-end items-center"
                        aria-label="View trade document"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View document</span>
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const LoadingState = ({ tradeType }: { tradeType: string }) => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32" />
            <div className="h-4 w-48" />
          </div>
          <div className="h-5 w-5" />
        </div>
      </Card>
    ))}
  </div>
);

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 p-4">
    <Alert variant="destructive" className="max-w-md w-full">
      {error}
    </Alert>
    <Button onClick={onRetry} variant="outline">
      Retry
    </Button>
  </div>
);

export default BulkBlockTrades;

