import { apiService } from "@/lib/api/services/api.service";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface MarketData {
  Symbol: string;
  SecurityName: string;
  TotalBuyVolume: string;
  TotalSellVolume: string;
  AvgBuyPrice: string;
  AvgSellPrice: string;
  TopBuyers: Trader[];
  TopSellers: Trader[];
  BuySellImbalance: string;
  ImbalanceType: string;
  PriceAnomalies: any[];
  PriceTrend: string;
  PotentialProfitableTrade: boolean;
}

interface Trader {
  BD_CLIENT_NAME: string;
  BD_TP_WATP: number;
  BD_DT_DATE: string;
  BD_REMARKS: string;
}

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`rounded-xl border border-gray-300 bg-white shadow-md transition-transform 
    transform hover:scale-105 dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    {children}
  </div>
);

const fetchTrades = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.bulkDeals.getDetails(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-gray-500 dark:text-gray-400">Loading trades...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <p className="text-red-500 dark:text-red-400">{error}</p>
    <button
      onClick={onRetry}
      className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:ring-2 
      focus:ring-blue-400 transition-all"
    >
      Try Again
    </button>
  </div>
);

const BulkBlockTradeInsights = () => {
  const [insights, setInsights] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTrades("today", "bulk_data");
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Bullish":
        return "text-green-500";
      case "Bearish":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadTrades} />;
  if (!insights) return null;

  return (
      <div className="space-y-4 max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.data.map((item) => (
            <Card key={item.Symbol}>
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.Symbol}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium bg-opacity-10 
                    ${getTrendColor(item.PriceTrend)}`}
                  >
                    {item.PriceTrend}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.SecurityName}
                </p>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Avg Buy Price
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{parseFloat(item.AvgBuyPrice).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Avg Sell Price
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{parseFloat(item.AvgSellPrice || "0").toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Top Buyers Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Top Buyers
                  </h3>
                  <div className="space-y-2">
                    {item.TopBuyers.map((buyer, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {buyer.BD_CLIENT_NAME}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          ₹{buyer.BD_TP_WATP.toFixed(2)} - {buyer.BD_DT_DATE}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Sellers Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Top Sellers
                  </h3>
                  <div className="space-y-2">
                    {item.TopSellers.map((seller, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {seller.BD_CLIENT_NAME}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          ₹{seller.BD_TP_WATP.toFixed(2)} - {seller.BD_DT_DATE}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
  );
};

export default BulkBlockTradeInsights;

