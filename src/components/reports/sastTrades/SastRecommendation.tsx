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
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { apiService } from "@/lib/api/services/api.service";

interface Recommendation {
  company: string;
  recommendations: string[];
}

export default function CompactRecommendations() {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await apiService.sastDeals.getRecommendation(
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

  const getRecommendationType = (text: string) => {
    if (text.toLowerCase().includes("buy")) return "buy";
    if (
      text.toLowerCase().includes("sell") ||
      text.toLowerCase().includes("reduce")
    )
      return "sell";
    return "neutral";
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
    <Card className="overflow-hidden">
      {data.map((item) => (
        <CompanyRecommendation
          key={item.company}
          item={item}
          expanded={expandedCompany === item.company}
          onToggle={() =>
            setExpandedCompany((prev) =>
              prev === item.company ? null : item.company
            )
          }
          getType={getRecommendationType}
        />
      ))}
    </Card>
  );
}

interface CompanyRecommendationProps {
  item: Recommendation;
  expanded: boolean;
  onToggle: () => void;
  getType: (text: string) => string;
}

const CompanyRecommendation = ({
  item,
  expanded,
  onToggle,
  getType,
}: CompanyRecommendationProps) => (
  <Collapsible open={expanded} onOpenChange={onToggle}>
    <CollapsibleTrigger className="w-full">
      <div className="p-4 flex justify-between items-center hover:bg-muted/50 border-b transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-medium">{item.company}</span>
          {item.recommendations.length > 0 && (
            <Badge variant="outline" className="px-2 py-1 text-xs">
              {item.recommendations.length} rec
              {item.recommendations.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            expanded ? "rotate-180" : ""
          )}
        />
      </div>
    </CollapsibleTrigger>

    <CollapsibleContent>
      <div className="px-4 pb-3 pt-1 space-y-2">
        {item.recommendations.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            No recommendations available
          </div>
        ) : (
          item.recommendations.map((rec, index) => (
            <RecommendationItem key={index} text={rec} type={getType(rec)} />
          ))
        )}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

interface RecommendationItemProps {
  text: string;
  type: string;
}

const RecommendationItem = ({ text, type }: RecommendationItemProps) => {
  const Icon =
    type === "buy" ? ArrowUp : type === "sell" ? ArrowDown : ChevronDown;
  const color =
    type === "buy"
      ? "text-success"
      : type === "sell"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", color)} />
      <span
        className={cn(
          "leading-relaxed",
          type === "neutral" ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {text}
      </span>
    </div>
  );
};

const LoadingSkeleton = () => (
  <Card className="overflow-hidden">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-10" />
          </div>
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    ))}
  </Card>
);
