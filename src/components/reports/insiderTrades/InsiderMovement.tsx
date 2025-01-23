import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { apiService } from "@/lib/api/services/api.service";

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

// API function for fetching trades
const fetchTransactionsMoves = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.insiderDeals.getMovements(timeFrame, params);
    console.log(response);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function HoldingsTable() {
  const [data, setData] = useState<HoldingChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTradesMoves = async () => {
    try {
      const data = await fetchTransactionsMoves("oneWeek", "insider_data");
      setData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTradesMoves();
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
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mode
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acquirer
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shares (%)
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Securities
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.mode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                {item.company}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {item.acquirer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                <span className="block">{item.beforeSharesPer}%</span>
                <span className="block text-gray-400">
                  → {item.afterSharesPer}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.shareChangePercentage >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.shareChangePercentage >= 0 ? "+" : ""}
                  {item.shareChangePercentage}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {item.secAcq.toLocaleString("en-IN")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatCurrency(item.secVal)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {formatDate(item.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-6 text-center text-gray-500">No data available</div>
      )}
    </div>
  );
}

