import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { apiService } from "@/lib/api/services/api.service";

interface CompanyInsights {
  company: string;
  totalAcquiredShares: number;
  totalSoldShares: number;
  acquisitionModes: string[];
  saleModes: string[];
  shareChangeDetails: Array<{
    beforeChange: number;
    afterChange: number;
    percentageChange: string;
  }>;
  averageShareChangePercentage: number | null;
  signals: string[];
  significantTransactions: Array<{
    acquirerName: string;
    noOfShareAcq: string | null;
    noOfShareSale: string | null;
    totAcqShare: string | null;
    totSaleShare: string | null;
    timestamp: string;
    attachement: string;
  }>;
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.sastDeals.getRecentActivity(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function CompanyInsightsDashboard() {
  const [data, setData] = useState<CompanyInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

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

  const formatNumber = (num: number) => num.toLocaleString("en-IN");
  const formatPercentage = (value: string) =>
    `${parseFloat(value).toFixed(2)}%`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg mx-4 my-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Corporate Transaction Insights
      </h1>

      <div className="space-y-6">
        {data.map((company) => (
          <div
            key={company.company}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <button
              onClick={() =>
                setExpandedCompany((prev) =>
                  prev === company.company ? null : company.company
                )
              }
              className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{company.company}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center text-green-600">
                    <ArrowUpIcon className="w-4 h-4 mr-1" />
                    {formatNumber(company.totalAcquiredShares)} Acquired
                  </span>
                  <span className="flex items-center text-red-600">
                    <ArrowDownIcon className="w-4 h-4 mr-1" />
                    {formatNumber(company.totalSoldShares)} Sold
                  </span>
                  {company.signals.map((signal) => (
                    <span
                      key={signal}
                      className={`px-2 py-1 rounded-full text-sm ${
                        signal.includes("Bullish")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
              <svg
                className={`w-6 h-6 transform transition-transform ${
                  expandedCompany === company.company ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedCompany === company.company && (
              <div className="p-6 pt-0 space-y-6">
                {/* Volume Analysis */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-4">Transaction Volume</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={[
                          {
                            name: "Acquired",
                            value: company.totalAcquiredShares,
                          },
                          { name: "Sold", value: company.totalSoldShares },
                        ]}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Share Change Analysis */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-4">Share Changes</h4>
                    <div className="space-y-3">
                      {company.shareChangeDetails.map((change, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>
                                {formatPercentage(change.percentageChange)}
                              </span>
                              <span className="text-gray-500">
                                {change.beforeChange}% → {change.afterChange}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    parseFloat(change.percentageChange),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Transaction Modes */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Acquisition Modes</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.acquisitionModes.map((mode) => (
                        <span
                          key={mode}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium mb-2">Sale Modes</h4>
                    <div className="flex flex-wrap gap-2">
                      {company.saleModes.map((mode) => (
                        <span
                          key={mode}
                          className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Significant Transactions */}
                {company.significantTransactions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Key Transactions</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm">
                              Party
                            </th>
                            <th className="px-4 py-2 text-right text-sm">
                              Shares
                            </th>
                            <th className="px-4 py-2 text-right text-sm">
                              Change
                            </th>
                            <th className="px-4 py-2 text-right text-sm">
                              Date
                            </th>
                            <th className="px-4 py-2 text-right text-sm">
                              Document
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {company.significantTransactions.map((txn, index) => (
                            <tr
                              key={index}
                              className="border-t hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                                {txn.acquirerName}
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {txn.noOfShareAcq ? `+${txn.noOfShareAcq}` : ""}
                                {txn.noOfShareSale
                                  ? `-${txn.noOfShareSale}`
                                  : ""}
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {txn.totAcqShare &&
                                  formatPercentage(txn.totAcqShare)}
                                {txn.totSaleShare &&
                                  formatPercentage(txn.totSaleShare)}
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                {new Date(txn.timestamp).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <a
                                  href={txn.attachement}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center justify-end gap-1"
                                >
                                  <DocumentIcon className="w-4 h-4" />
                                  <span className="sr-only">View Document</span>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ReactTooltip effect="solid" place="top" />
    </div>
  );
}

