import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { apiService } from "@/lib/api/services/api.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface PotentialSignal {
  company: string;
  acquirer?: string;
  seller?: string;
  secAcq?: number;
  secSold?: number;
  beforeSharesPer: number;
  afterSharesPer: number;
  date: string;
  potentialProfit: string;
  type: "buy" | "sell";
}

export default function MarketSignals() {
  const [buySignals, setBuySignals] = useState<PotentialSignal[]>([]);
  const [sellSignals, setSellSignals] = useState<PotentialSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.insiderDeals.getAnalytics(
          "oneWeek",
          "insider_data"
        );
        const data = response.data;

        setBuySignals(data.potentialBuySignals.map(transformSignal("buy")));
        setSellSignals(data.potentialSellSignals.map(transformSignal("sell")));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, []);

  const transformSignal =
    (type: "buy" | "sell") =>
    (item: any): PotentialSignal => ({
      ...item,
      type,
      party: type === "buy" ? item.acquirer : item.seller,
      securities: type === "buy" ? item.secAcq : item.secSold,
    });

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <SignalTable
        type="buy"
        signals={buySignals}
        title="Potential Buy Signals"
        badgeVariant="success"
      />

      <SignalTable
        type="sell"
        signals={sellSignals}
        title="Potential Sell Signals"
        badgeVariant="destructive"
      />
    </div>
  );
}

interface SignalTableProps {
  type: "buy" | "sell";
  signals: PotentialSignal[];
  title: string;
  badgeVariant: "success" | "destructive";
}

const formatProfit = (profit: string, type: "buy" | "sell") => {
  if (profit === "Infinity") return "∞";
  return (
    <span
      className={cn(
        "font-medium",
        type === "buy"
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      )}
    >
      {profit}%
    </span>
  );
};

const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd MMM yyyy HH:mm");
  } catch {
    return dateString;
  }
};

const SignalTable = ({
  type,
  signals,
  title,
  badgeVariant,
}: SignalTableProps) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <Badge variant={badgeVariant} className="px-3 py-1 text-sm">
        {signals.length} signals
      </Badge>
    </div>

    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table className="bg-card">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>{type === "buy" ? "Acquirer" : "Seller"}</TableHead>
            <TableHead className="text-right">Securities</TableHead>
            <TableHead className="text-right">Shares (%)</TableHead>
            <TableHead className="text-right">Potential Profit</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((item, index) => (
            <TableRow
              key={`${type}-${index}`}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{item.company}</TableCell>
              <TableCell>
                {type === "buy" ? item.acquirer : item.seller}
              </TableCell>
              <TableCell className="text-right">
                {(type === "buy"
                  ? item.secAcq
                  : item.secSold
                )?.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col">
                  <span>{item.beforeSharesPer}%</span>
                  <span className="text-muted-foreground text-xs">
                    → {item.afterSharesPer}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {formatProfit(item.potentialProfit, type)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDate(item.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {signals.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          No {type} signals available
        </div>
      )}
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-8 p-6">
    {[1, 2].map((_, index) => (
      <div key={index}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

