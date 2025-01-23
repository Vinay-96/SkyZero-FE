import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { apiService } from "@/lib/api/services/api.service";

interface PotentialSignal {
  company: string;
  acquirer?: string;
  seller?: string;
  secAcq?: number;
  secSold?: number;
  beforeSharesPer: number;
  afterSharesPer: number;
  date: string;
  potentialProfit: string;
  type: "buy" | "sell";
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.insiderDeals.getAnalytics(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function MarketSignals() {
  const [buySignals, setBuySignals] = useState<PotentialSignal[]>([]);
  const [sellSignals, setSellSignals] = useState<PotentialSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTransactions("oneWeek", "insider_data");
        if (!response) throw new Error("Failed to fetch");
        const data = await response.data;

        const buys = data.potentialBuySignals.map((item: any) => ({
          ...item,
          type: "buy",
          party: item.acquirer,
          securities: item.secAcq,
        }));

        const sells = data.potentialSellSignals.map((item: any) => ({
          ...item,
          type: "sell",
          party: item.seller,
          securities: item.secSold,
        }));

        setBuySignals(buys);
        setSellSignals(sells);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatProfit = (profit: string, type: "buy" | "sell") => {
    if (profit === "Infinity") return "∞";
    return (
      <span className={`${type === "buy" ? "text-green-600" : "text-red-600"}`}>
        {profit}%
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Buy Signals Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Potential Buy Signals
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {buySignals.length} signals
          </span>
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acquirer
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Securities
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Potential Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buySignals.map((item, index) => (
                <tr key={`buy-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.acquirer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.secAcq?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <span className="block">{item.beforeSharesPer}%</span>
                    <span className="block text-gray-400">
                      → {item.afterSharesPer}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    {formatProfit(item.potentialProfit, "buy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatDate(item.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {buySignals.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No buy signals available
            </div>
          )}
        </div>
      </div>

      {/* Sell Signals Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Potential Sell Signals
          <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {sellSignals.length} signals
          </span>
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Securities
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares (%)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Potential Profit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellSignals.map((item, index) => (
                <tr key={`sell-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.seller}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.secSold?.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <span className="block">{item.beforeSharesPer}%</span>
                    <span className="block text-gray-400">
                      → {item.afterSharesPer}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    {formatProfit(item.potentialProfit, "sell")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatDate(item.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sellSignals.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No sell signals available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

