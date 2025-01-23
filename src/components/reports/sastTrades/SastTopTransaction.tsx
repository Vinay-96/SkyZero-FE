import { useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "@/lib/api/services/api.service";

interface Transaction {
  acquirerName: string;
  symbol: string;
  noOfShareAcq: string | null;
  noOfShareSale: string | null;
  totAcqShare: string | null;
  totSaleShare: string | null;
  timestamp: string;
  attachement: string;
  company: string;
  acquisitionMode: string;
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.sastDeals.getTopTransactions(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function MarketActivity() {
  const [data, setData] = useState<{
    topBuys: Transaction[];
    topSells: Transaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTransactions("oneWeek", "SAST_data");
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

  const formatNumber = (num: string | null) =>
    num ? parseInt(num).toLocaleString("en-IN") : "-";

  const formatPercentage = (value: string | null) =>
    value ? `${parseFloat(value).toFixed(2)}%` : "-";

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Market Activity</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Buys */}
        <div className="border rounded-lg bg-green-50">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ArrowUpIcon className="w-5 h-5 text-green-600" />
              Top Buys
            </h2>
          </div>
          <div className="space-y-2 p-2">
            {data?.topBuys.map((txn, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() =>
                    setExpandedTransaction((prev) =>
                      prev === txn.symbol + index ? null : txn.symbol + index
                    )
                  }
                  className="w-full p-3 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{txn.company}</div>
                    <div className="text-sm text-gray-600">{txn.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      +{formatNumber(txn.noOfShareAcq)}
                    </div>
                    <div className="text-sm">
                      {formatPercentage(txn.totAcqShare)}
                    </div>
                  </div>
                </button>

                {expandedTransaction === txn.symbol + index && (
                  <div className="p-3 pt-0 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Acquired by</span>
                      <span className="text-gray-600">{txn.acquirerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode</span>
                      <span className="text-gray-600">
                        {txn.acquisitionMode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="text-gray-600">
                        {new Date(txn.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={txn.attachement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <DocumentIcon className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Sells */}
        <div className="border rounded-lg bg-red-50">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ArrowDownIcon className="w-5 h-5 text-red-600" />
              Top Sells
            </h2>
          </div>
          <div className="space-y-2 p-2">
            {data?.topSells.map((txn, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() =>
                    setExpandedTransaction((prev) =>
                      prev === txn.symbol + index ? null : txn.symbol + index
                    )
                  }
                  className="w-full p-3 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{txn.company}</div>
                    <div className="text-sm text-gray-600">{txn.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">
                      -{formatNumber(txn.noOfShareSale)}
                    </div>
                    <div className="text-sm">
                      {formatPercentage(txn.totSaleShare)}
                    </div>
                  </div>
                </button>

                {expandedTransaction === txn.symbol + index && (
                  <div className="p-3 pt-0 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sold by</span>
                      <span className="text-gray-600">{txn.acquirerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode</span>
                      <span className="text-gray-600">
                        {txn.acquisitionMode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="text-gray-600">
                        {new Date(txn.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <a
                      href={txn.attachement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <DocumentIcon className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

