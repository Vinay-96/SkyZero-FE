import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";
import { format } from "date-fns";

interface Transaction {
  symbol: string;
  company: string;
  acqName: string;
  date: string;
  secType: string;
  acqMode: string;
  befAcqSharesNo: string;
  befAcqSharesPer: string;
  afterAcqSharesNo: string;
  afterAcqSharesPer: string;
}

interface TransactionData {
  "Market Sale": Transaction[];
  "Preferential Offer": Transaction[];
  "Market Purchase": Transaction[];
  "Off Market": Transaction[];
}

export default function StockTransactionsView() {
  const [transactions, setTransactions] = useState<TransactionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadTrades = async () => {
      try {
        const response = await apiService.insiderDeals.getAll(
          "oneWeek",
          "insider_data"
        );
        setTransactions(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrades();
    return () => abortController.abort();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

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

  if (!transactions) return null;

  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto")}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Stock Transactions
        </h1>

        <Tabs defaultValue="Market Sale" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(transactions).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-accent/50"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(transactions).map(([tabName, transactions]) => (
            <TabsContent key={tabName} value={tabName}>
              <div className="rounded-md border shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Acquirer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">
                        Shares Before
                      </TableHead>
                      <TableHead className="text-right">Shares After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {transaction.symbol}
                        </TableCell>
                        <TableCell>{transaction.company}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.acqName}
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="text-right">
                          {`${transaction.befAcqSharesNo} (${transaction.befAcqSharesPer}%)`}
                        </TableCell>
                        <TableCell className="text-right">
                          {`${transaction.afterAcqSharesNo} (${transaction.afterAcqSharesPer}%)`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {transactions.length === 0 && (
                  <div className="p-6 text-center text-muted-foreground">
                    No transactions found
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
    <Skeleton className="h-8 w-[200px]" />

    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-md" />
        ))}
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(6)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
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
  </div>
);
