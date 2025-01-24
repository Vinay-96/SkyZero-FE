import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, FileText, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyInsights {
  company: string;
  totalAcquiredShares: number;
  totalSoldShares: number;
  acquisitionModes: string[];
  saleModes: string[];
  shareChangeDetails: Array<{
    beforeChange: number;
    afterChange: number;
    percentageChange: string;
  }>;
  averageShareChangePercentage: number | null;
  signals: string[];
  significantTransactions: Array<{
    acquirerName: string;
    noOfShareAcq: string | null;
    noOfShareSale: string | null;
    totAcqShare: string | null;
    totSaleShare: string | null;
    timestamp: string;
    attachement: string;
  }>;
}

export default function CompanyInsightsDashboard() {
  const [data, setData] = useState<CompanyInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.sastDeals.getRecentActivity(
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

  const formatNumber = (num: number) => num.toLocaleString("en-IN");
  const formatPercentage = (value: string) =>
    `${parseFloat(value).toFixed(2)}%`;

  if (loading) return <LoadingSkeleton />;
  if (error) return <Alert variant="destructive">{error}</Alert>;

  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto")}>
      <h1 className="text-2xl font-bold tracking-tight mb-8">
        Corporate Transaction Insights
      </h1>

      <div className="space-y-4">
        {data.map((company) => (
          <CompanyAccordion
            key={company.company}
            company={company}
            expanded={expandedCompany === company.company}
            onExpand={() =>
              setExpandedCompany((prev) =>
                prev === company.company ? null : company.company
              )
            }
            formatNumber={formatNumber}
            formatPercentage={formatPercentage}
          />
        ))}
      </div>
    </div>
  );
}

const CompanyAccordion = ({
  company,
  expanded,
  onExpand,
  formatNumber,
  formatPercentage,
}: {
  company: CompanyInsights;
  expanded: boolean;
  onExpand: () => void;
  formatNumber: (num: number) => string;
  formatPercentage: (value: string) => string;
}) => (
  <Collapsible open={expanded} onOpenChange={onExpand}>
    <Card className="overflow-hidden">
      <CollapsibleTrigger className="w-full">
        <div className="p-6 flex justify-between items-center hover:bg-muted/50 transition-colors">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{company.company}</h3>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="success" className="gap-1">
                <ArrowUp className="h-4 w-4" />
                {formatNumber(company.totalAcquiredShares)} Acquired
              </Badge>
              <Badge variant="destructive" className="gap-1">
                <ArrowDown className="h-4 w-4" />
                {formatNumber(company.totalSoldShares)} Sold
              </Badge>
              {company.signals.map((signal) => (
                <Badge
                  key={signal}
                  variant={
                    signal.includes("Bullish") ? "success" : "destructive"
                  }
                >
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-6 w-6 transition-transform",
              expanded ? "rotate-180" : ""
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-6 pt-0 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <VolumeChart company={company} />
            <ShareChanges
              company={company}
              formatPercentage={formatPercentage}
            />
          </div>

          <TransactionModes company={company} />
          <SignificantTransactions
            company={company}
            formatPercentage={formatPercentage}
          />
        </div>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

const VolumeChart = ({ company }: { company: CompanyInsights }) => (
  <Card className="p-4">
    <h4 className="font-medium mb-4">Transaction Volume</h4>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={[
          { name: "Acquired", value: company.totalAcquiredShares },
          { name: "Sold", value: company.totalSoldShares },
        ]}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

const ShareChanges = ({
  company,
  formatPercentage,
}: {
  company: CompanyInsights;
  formatPercentage: (value: string) => string;
}) => (
  <Card className="p-4">
    <h4 className="font-medium mb-4">Share Changes</h4>
    <div className="space-y-4">
      {company.shareChangeDetails.map((change, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatPercentage(change.percentageChange)}</span>
            <span className="text-muted-foreground">
              {change.beforeChange}% → {change.afterChange}%
            </span>
          </div>
          <Progress
            value={Math.min(parseFloat(change.percentageChange), 100)}
            className="h-2"
          />
        </div>
      ))}
    </div>
  </Card>
);

const TransactionModes = ({ company }: { company: CompanyInsights }) => (
  <div className="grid md:grid-cols-2 gap-4">
    <Card className="p-4">
      <h4 className="font-medium mb-2">Acquisition Modes</h4>
      <div className="flex flex-wrap gap-2">
        {company.acquisitionModes.map((mode) => (
          <Badge key={mode} variant="outline">
            {mode}
          </Badge>
        ))}
      </div>
    </Card>
    <Card className="p-4">
      <h4 className="font-medium mb-2">Sale Modes</h4>
      <div className="flex flex-wrap gap-2">
        {company.saleModes.map((mode) => (
          <Badge key={mode} variant="outline">
            {mode}
          </Badge>
        ))}
      </div>
    </Card>
  </div>
);

const SignificantTransactions = ({
  company,
  formatPercentage,
}: {
  company: CompanyInsights;
  formatPercentage: (value: string) => string;
}) => (
  <Card>
    <h4 className="font-medium p-4">Key Transactions</h4>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Party</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Date</TableHead>
          <TableHead className="text-right">Document</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {company.significantTransactions.map((txn, index) => (
          <TableRow key={index}>
            <TableCell className="max-w-[200px] truncate">
              {txn.acquirerName}
            </TableCell>
            <TableCell className="text-right">
              {txn.noOfShareAcq ? `+${txn.noOfShareAcq}` : ""}
              {txn.noOfShareSale ? `-${txn.noOfShareSale}` : ""}
            </TableCell>
            <TableCell className="text-right">
              {txn.totAcqShare
                ? formatPercentage(txn.totAcqShare)
                : txn.totSaleShare
                ? formatPercentage(txn.totSaleShare)
                : "-"}
            </TableCell>
            <TableCell className="text-right">
              {new Date(txn.timestamp).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <a
                href={txn.attachement}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex gap-1 justify-end"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">View Document</span>
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </Card>
    ))}
  </div>
);

