import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/services/api.service";

interface TransactionCategory {
  totalTransactions: number;
  totalSecuritiesAcquired: number;
  companies: Record<string, number>;
  persons: Record<string, number>;
}

interface TransactionData {
  [key: string]: TransactionCategory;
}

const formatNumber = (num: number) => num.toLocaleString("en-IN");

export default function TransactionDashboard() {
  const [data, setData] = useState<TransactionData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<{
    category: string;
    type: "companies" | "persons";
  } | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.insiderDeals.getRecentActivity(
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

    fetchData();
    return () => abortController.abort();
  }, []);

  const toggleSection = (category: string, type: "companies" | "persons") => {
    setExpandedSection((prev) =>
      prev?.category === category && prev.type === type
        ? null
        : { category, type }
    );
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

  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto")}>
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Transaction Analysis Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data).map(([category, details]) => (
          <Card key={category} className="overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold truncate">{category}</h2>
            </div>

            <div className="p-4 space-y-4">
              <KeyValuePair
                label="Total Transactions"
                value={details.totalTransactions}
              />
              <KeyValuePair
                label="Total Securities"
                value={formatNumber(details.totalSecuritiesAcquired)}
              />

              <ExpandableSection
                category={category}
                type="companies"
                count={Object.keys(details.companies).length}
                expandedSection={expandedSection}
                onToggle={toggleSection}
                data={details.companies}
              />

              <ExpandableSection
                category={category}
                type="persons"
                count={Object.keys(details.persons).length}
                expandedSection={expandedSection}
                onToggle={toggleSection}
                data={details.persons}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface ExpandableSectionProps {
  category: string;
  type: "companies" | "persons";
  count: number;
  expandedSection: { category: string; type: "companies" | "persons" } | null;
  onToggle: (category: string, type: "companies" | "persons") => void;
  data: Record<string, number>;
}

const ExpandableSection = ({
  category,
  type,
  count,
  expandedSection,
  onToggle,
  data,
}: ExpandableSectionProps) => {
  const isExpanded =
    expandedSection?.category === category && expandedSection.type === type;

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggle(category, type)}
    >
      <CollapsibleTrigger className="w-full">
        <div className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
          <span className="text-sm">
            {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded ? "rotate-180" : ""
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-muted/50 p-2 rounded-md max-h-48 overflow-y-auto">
          {Object.entries(data).map(([name, count]) => (
            <div key={name} className="flex justify-between py-1 px-2 text-sm">
              <span className="truncate">{name}</span>
              <span className="font-medium">{formatNumber(count)}</span>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const KeyValuePair = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
    <Skeleton className="h-8 w-[300px]" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-4 space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

