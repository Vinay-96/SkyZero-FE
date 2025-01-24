// components/market/trading-view-heatmap.tsx
import { useEffect, useRef, memo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TradingViewHeatmap = memo(() => {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWidget = () => {
      if (!container.current || container.current.children.length > 0) return;

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        exchanges: ["BSE"],
        dataSource: "SENSEX",
        grouping: "sector",
        blockSize: "market_cap_basic",
        blockColor: "change|60",
        locale: "en",
        symbolUrl: "",
        colorTheme: "dark",
        hasTopBar: true,
        isDataSetEnabled: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        isMonoSize: false,
        width: "100%",
        height: "100%",
      });

      script.onload = () => {
        setLoading(false);
        setError(null);
      };
      script.onerror = () => {
        setError("Failed to load TradingView widget");
        setLoading(false);
      };

      container.current.appendChild(script);
    };

    // Delay load to prevent layout shift
    const timeout = setTimeout(loadWidget, 300);
    return () => {
      clearTimeout(timeout);
      if (container.current) container.current.innerHTML = "";
    };
  }, []);

  if (error) {
    return (
      <Alert variant="destructive" className="h-[600px]">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Market Heatmap</h2>
        <span className="text-sm text-muted-foreground">
          BSE Sector Performance
        </span>
      </div>

      {loading && <Skeleton className="h-[600px] w-full rounded-lg" />}

      <div
        ref={container}
        className="tradingview-widget-container h-[600px] w-full"
      >
        <div className="tradingview-widget-container__widget" />
        <div className="tradingview-widget-copyright text-xs text-muted-foreground mt-2">
          <a
            href="https://www.tradingview.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Track all markets on TradingView
          </a>
        </div>
      </div>
    </div>
  );
});

TradingViewHeatmap.displayName = "TradingViewHeatmap";
export default TradingViewHeatmap;

