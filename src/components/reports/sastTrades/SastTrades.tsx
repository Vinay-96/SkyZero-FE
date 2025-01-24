import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";

interface Transaction {
  acquirerName: string;
  noOfShareAcq: string | null;
  noOfShareSale: string | null;
  totAcqShare: string | null;
  totSaleShare: string | null;
  timestamp: string;
  attachement: string;
  acqSaleType: string;
}

interface CompanyData {
  Acquisition: Transaction[];
  Sale: Transaction[];
  Both: Transaction[];
}

export default function MinimalTransactions() {
  const [data, setData] = useState<Record<string, CompanyData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.sastDeals.getAll(
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

  const formatNumber = (num: string | null) =>
    num ? parseInt(num).toLocaleString("en-IN") : "-";

  const formatPercentage = (value: string | null) =>
    value ? `${parseFloat(value).toFixed(2)}%` : "-";

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
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      {Object.entries(data).map(([company, transactions]) => (
        <CompanyAccordion
          key={company}
          company={company}
          transactions={transactions}
          expanded={expandedCompany === company}
          onExpand={() =>
            setExpandedCompany((prev) => (prev === company ? null : company))
          }
          formatNumber={formatNumber}
          formatPercentage={formatPercentage}
        />
      ))}
    </div>
  );
}

interface CompanyAccordionProps {
  company: string;
  transactions: CompanyData;
  expanded: boolean;
  onExpand: () => void;
  formatNumber: (num: string | null) => string;
  formatPercentage: (value: string | null) => string;
}

const CompanyAccordion = ({
  company,
  transactions,
  expanded,
  onExpand,
  formatNumber,
  formatPercentage,
}: CompanyAccordionProps) => (
  <Collapsible open={expanded} onOpenChange={onExpand}>
    <Card className="overflow-hidden">
      <CollapsibleTrigger className="w-full">
        <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <h3 className="font-medium">{company}</h3>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              expanded ? "rotate-180" : ""
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-4 pt-0 space-y-4">
          {(["Acquisition", "Sale", "Both"] as const).map(
            (type) =>
              transactions[type].length > 0 && (
                <TransactionSection
                  key={type}
                  type={type}
                  transactions={transactions[type]}
                  formatNumber={formatNumber}
                  formatPercentage={formatPercentage}
                />
              )
          )}
        </div>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

interface TransactionSectionProps {
  type: "Acquisition" | "Sale" | "Both";
  transactions: Transaction[];
  formatNumber: (num: string | null) => string;
  formatPercentage: (value: string | null) => string;
}

const TransactionSection = ({
  type,
  transactions,
  formatNumber,
  formatPercentage,
}: TransactionSectionProps) => {
  const variant =
    type === "Acquisition"
      ? "success"
      : type === "Sale"
      ? "destructive"
      : "info";

  return (
    <div className="border-t pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={variant} className="text-xs">
          {type} ({transactions.length})
        </Badge>
      </div>

      <div className="space-y-2">
        {transactions.map((txn, index) => (
          <TransactionCard
            key={index}
            txn={txn}
            type={type}
            formatNumber={formatNumber}
            formatPercentage={formatPercentage}
          />
        ))}
      </div>
    </div>
  );
};

interface TransactionCardProps {
  txn: Transaction;
  type: "Acquisition" | "Sale" | "Both";
  formatNumber: (num: string | null) => string;
  formatPercentage: (value: string | null) => string;
}

const TransactionCard = ({
  txn,
  type,
  formatNumber,
  formatPercentage,
}: TransactionCardProps) => {
  const shares =
    type === "Acquisition"
      ? txn.noOfShareAcq
      : type === "Sale"
      ? txn.noOfShareSale
      : txn.noOfShareAcq || txn.noOfShareSale;

  return (
    <Card className="p-3 bg-muted/50">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">{txn.acquirerName}</span>
        <span className="text-muted-foreground text-sm">
          {new Date(txn.timestamp).toLocaleDateString()}
        </span>
      </div>

      <div className="flex justify-between items-center mt-1">
        <span className="text-sm">
          {type !== "Sale" &&
            txn.noOfShareAcq &&
            `+${formatNumber(txn.noOfShareAcq)}`}
          {type !== "Acquisition" &&
            txn.noOfShareSale &&
            `-${formatNumber(txn.noOfShareSale)}`}{" "}
          shares
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            type === "Acquisition"
              ? "text-success"
              : type === "Sale"
              ? "text-destructive"
              : "text-info"
          )}
        >
          {formatPercentage(txn.totAcqShare || txn.totSaleShare)}
        </span>
      </div>

      {txn.attachement && (
        <a
          href={txn.attachement}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary text-xs mt-2 hover:underline"
        >
          <FileText className="w-4 h-4" />
          View Document
        </a>
      )}
    </Card>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4 max-w-4xl mx-auto p-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </Card>
    ))}
  </div>
);
