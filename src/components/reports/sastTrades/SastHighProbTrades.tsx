import { useState, useEffect } from "react";
import {
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
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

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.sastDeals.getAnalytics(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function HighWinTrades() {
  const [data, setData] = useState<{
    topBuys: Transaction[];
    topSells: Transaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTransactions("oneMonth", "SAST_data");
        if (!response) throw new Error("Failed to fetch");
        const data = await response.data;
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    );
  }

  // Group trades by company
  const groupedTrades = data.reduce((acc, trade) => {
    if (!acc[trade.company]) {
      acc[trade.company] = [];
    }
    acc[trade.company].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  const formatNumber = (num: string) => parseInt(num).toLocaleString("en-IN");
  const formatPercentage = (value: string) => `${value}%`;

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b bg-green-50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CheckBadgeIcon className="w-5 h-5 text-green-600" />
          High-Probability Trades
        </h2>
      </div>

      <div className="divide-y">
        {Object.entries(groupedTrades).map(([company, trades]) => (
          <div key={company} className="hover:bg-gray-50">
            <button
              onClick={() =>
                setExpandedCompany((prev) =>
                  prev === company ? null : company
                )
              }
              className="w-full p-4 text-left flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{company}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {trades.length} significant acquisition
                  {trades.length > 1 ? "s" : ""}
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
            </button>

            {expandedCompany === company && (
              <div className="px-4 pb-4 pt-0 space-y-3">
                {trades.map((trade, index) => (
                  <div
                    key={index}
                    className="text-sm border rounded-lg p-3 bg-green-50"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Acquired by</span>
                      <span className="text-gray-600">
                        {trade.acquirerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shares Acquired</span>
                      <span className="font-medium">
                        {formatNumber(trade.sharesAcquired)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stake Acquired</span>
                      <span className="font-medium text-green-600">
                        {formatPercentage(trade.totalAcquiredPercentage)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode</span>
                      <span className="text-gray-600">
                        {trade.acquisitionMode}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start gap-2 text-green-700">
                      <CheckBadgeIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{trade.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

