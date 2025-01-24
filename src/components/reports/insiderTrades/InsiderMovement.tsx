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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HoldingChange {
  mode: string;
  company: string;
  acquirer: string;
  beforeSharesPer: number;
  afterSharesPer: number;
  shareChangePercentage: number;
  secAcq: number;
  secVal: number;
  date: string;
}

export default function HoldingsTable() {
  const [data, setData] = useState<HoldingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadTradesMoves = async () => {
      try {
        const response = await apiService.insiderDeals.getMovements(
          "oneWeek",
          "insider_data"
        );
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    loadTradesMoves();
    return () => abortController.abort();
  }, []);

  const formatCurrency = (value: number) => {
    return value === 0 ? "-" : `₹${value.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

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
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table className="bg-card">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Mode</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Acquirer</TableHead>
            <TableHead className="text-right">Shares (%)</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Securities</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={index}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {item.mode}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{item.company}</TableCell>
              <TableCell className="text-muted-foreground">
                {item.acquirer}
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
                <Badge
                  variant={
                    item.shareChangePercentage >= 0 ? "success" : "destructive"
                  }
                  className="px-2 py-1 text-xs"
                >
                  {item.shareChangePercentage >= 0 ? "+" : ""}
                  {item.shareChangePercentage}%
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {item.secAcq.toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.secVal)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDate(item.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length === 0 && (
        <div className="p-6 text-center text-muted-foreground">
          No holdings data available
        </div>
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {[...Array(8)].map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-6 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              {[...Array(8)].map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);
