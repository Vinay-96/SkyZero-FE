import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/lib/api/services/api.service";

interface Trade {
  company: string;
  acquirerName: string;
  acquisitionMode: string;
  sharesAcquired: string;
  totalAcquiredPercentage: string;
  recommendation: string;
}

interface TradeGroup {
  [key: string]: Trade[];
}

export default function HighWinTrades() {
  const [data, setData] = useState<TradeGroup>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.sastDeals.getAnalytics(
          "oneMonth",
          "SAST_data"
        );
        const groupedData = response.data.reduce(
          (acc: TradeGroup, trade: Trade) => {
            acc[trade.company] = acc[trade.company] || [];
            acc[trade.company].push(trade);
            return acc;
          },
          {}
        );
        setData(groupedData);
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
    <Card className="overflow-hidden">
      <div
        className={cn("p-4 border-b", "bg-success/10 text-success-foreground")}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5" />
          High-Probability Trades
        </h2>
      </div>

      <div className="divide-y">
        {Object.entries(data).map(([company, trades]) => (
          <CompanyGroup
            key={company}
            company={company}
            trades={trades}
            expanded={expandedCompany === company}
            onToggle={() =>
              setExpandedCompany((prev) => (prev === company ? null : company))
            }
          />
        ))}
      </div>
    </Card>
  );
}

interface CompanyGroupProps {
  company: string;
  trades: Trade[];
  expanded: boolean;
  onToggle: () => void;
}

const CompanyGroup = ({
  company,
  trades,
  expanded,
  onToggle,
}: CompanyGroupProps) => (
  <Collapsible open={expanded} onOpenChange={onToggle}>
    <CollapsibleTrigger className="w-full">
      <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
        <div>
          <h3 className="font-medium text-left">{company}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {trades.length} significant acquisition
            {trades.length > 1 ? "s" : ""}
          </p>
        </div>
        <ArrowTrendingUpIcon className="w-5 h-5 text-success" />
      </div>
    </CollapsibleTrigger>

    <CollapsibleContent>
      <div className="px-4 pb-4 pt-0 space-y-3">
        {trades.map((trade, index) => (
          <TradeDetail key={index} trade={trade} />
        ))}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

interface TradeDetailProps {
  trade: Trade;
}

const TradeDetail = ({ trade }: TradeDetailProps) => (
  <Card className="p-4 bg-success/5 border-success/20">
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Acquired by</span>
        <span className="font-medium">{trade.acquirerName}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Shares Acquired</span>
        <span className="font-medium">
          {parseInt(trade.sharesAcquired).toLocaleString("en-IN")}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Stake Acquired</span>
        <span className="font-medium text-success">
          {trade.totalAcquiredPercentage}%
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Mode</span>
        <span className="text-muted-foreground">{trade.acquisitionMode}</span>
      </div>

      <Badge variant="success" className="mt-2 gap-2 w-full justify-start">
        <CheckBadgeIcon className="w-4 h-4" />
        {trade.recommendation}
      </Badge>
    </div>
  </Card>
);

const LoadingSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="p-4 border-b space-y-2">
      <Skeleton className="h-6 w-[200px]" />
    </div>
    <div className="p-4 space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-[100px] w-full" />
        </div>
      ))}
    </div>
  </Card>
);

