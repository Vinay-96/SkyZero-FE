import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, FileText } from "lucide-react";
import { apiService } from "@/lib/api/services/api.service";

interface Transaction {
  acquirerName: string;
  symbol: string;
  noOfShareAcq: string | null;
  noOfShareSale: string | null;
  totAcqShare: string | null;
  totSaleShare: string | null;
  timestamp: string;
  attachement: string;
  company: string;
  acquisitionMode: string;
}

export default function MarketActivity() {
  const [data, setData] = useState<{
    topBuys: Transaction[];
    topSells: Transaction[];
  }>({
    topBuys: [],
    topSells: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.sastDeals.getTopTransactions(
          "oneWeek",
          "SAST_data"
        );
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => abortController.abort();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto")}>
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Market Activity
      </h1>

      <div className="grid md:grid-cols-2 gap-4">
        <TransactionGroup
          type="buy"
          transactions={data.topBuys}
          expandedId={expandedId}
          onExpand={setExpandedId}
        />
        <TransactionGroup
          type="sell"
          transactions={data.topSells}
          expandedId={expandedId}
          onExpand={setExpandedId}
        />
      </div>
    </div>
  );
}

interface TransactionGroupProps {
  type: "buy" | "sell";
  transactions: Transaction[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
}

const TransactionGroup = ({
  type,
  transactions,
  expandedId,
  onExpand,
}: TransactionGroupProps) => {
  const Icon = type === "buy" ? ArrowUp : ArrowDown;
  // const variant = type === "buy" ? "success" : "destructive";

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          "p-4 border-b",
          type === "buy" ? "bg-success/10" : "bg-destructive/10"
        )}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {type === "buy" ? "Top Buys" : "Top Sells"}
        </h2>
      </div>

      <div className="p-2 space-y-2">
        {transactions.map((txn, index) => {
          const id = `${txn.symbol}-${index}`;
          const shares = type === "buy" ? txn.noOfShareAcq : txn.noOfShareSale;
          const percentage =
            type === "buy" ? txn.totAcqShare : txn.totSaleShare;

          return (
            <TransactionItem
              key={id}
              txn={txn}
              type={type}
              shares={shares}
              percentage={percentage}
              isExpanded={expandedId === id}
              onExpand={() => onExpand(expandedId === id ? null : id)}
            />
          );
        })}
      </div>
    </Card>
  );
};

interface TransactionItemProps {
  txn: Transaction;
  type: "buy" | "sell";
  shares: string | null;
  percentage: string | null;
  isExpanded: boolean;
  onExpand: () => void;
}

const formatNumber = (num: string | null) =>
  num ? parseInt(num).toLocaleString("en-IN") : "-";

const formatPercentage = (value: string | null) =>
  value ? `${parseFloat(value).toFixed(2)}%` : "-";

const TransactionItem = ({
  txn,
  type,
  shares,
  percentage,
  isExpanded,
  onExpand,
}: TransactionItemProps) => (
  <Collapsible open={isExpanded} onOpenChange={onExpand}>
    <Card className="overflow-hidden">
      <CollapsibleTrigger className="w-full">
        <div className="p-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div>
            <div className="font-medium">{txn.company}</div>
            <div className="text-sm text-muted-foreground">{txn.symbol}</div>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "font-medium",
                type === "buy" ? "text-success" : "text-destructive"
              )}
            >
              {type === "buy" ? "+" : "-"}
              {formatNumber(shares)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatPercentage(percentage)}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-3 pt-0 space-y-3 text-sm">
          <DetailRow
            label={type === "buy" ? "Acquired by" : "Sold by"}
            value={txn.acquirerName}
          />
          <DetailRow label="Mode" value={txn.acquisitionMode} />
          <DetailRow
            label="Date"
            value={new Date(txn.timestamp).toLocaleDateString()}
          />

          {txn.attachement && (
            <a
              href={txn.attachement}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <FileText className="w-4 h-4" />
              View Document
            </a>
          )}
        </div>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
    <Skeleton className="h-8 w-[200px]" />

    <div className="grid md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-2 space-y-2">
            {[...Array(3)].map((_, j) => (
              <Card key={j} className="p-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

