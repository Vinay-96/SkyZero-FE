import { apiService } from "@/lib/api/services/api.service";
import { useEffect, useState } from "react";

interface Transaction {
  acquirerName: string;
  noOfShareAcq: string | null;
  noOfShareSale: string | null;
  totAcqShare: string | null;
  totSaleShare: string | null;
  timestamp: string;
  attachement: string;
  acqSaleType: string;
}

interface CompanyData {
  Acquisition: Transaction[];
  Sale: Transaction[];
  Both: Transaction[];
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.sastDeals.getAll(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function MinimalTransactions() {
  const [data, setData] = useState<Record<string, CompanyData>>({});
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

  const formatPercentage = (value: string | null) =>
    value ? `${parseFloat(value).toFixed(2)}%` : "-";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      {Object.entries(data).map(([company, transactions]) => (
        <div key={company} className="border rounded-lg shadow-sm">
          <button
            onClick={() =>
              setExpandedCompany((prev) => (prev === company ? null : company))
            }
            className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <h3 className="font-medium">{company}</h3>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedCompany === company ? "rotate-180" : ""
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

          {expandedCompany === company && (
            <div className="p-4 pt-0 space-y-4">
              {(["Acquisition", "Sale", "Both"] as const).map(
                (type) =>
                  transactions[type].length > 0 && (
                    <div key={type} className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">
                        {type} ({transactions[type].length})
                      </h4>
                      <div className="space-y-2">
                        {transactions[type].map((txn, index) => (
                          <div
                            key={index}
                            className="text-sm p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {txn.acquirerName}
                              </span>
                              <span className="text-gray-600">
                                {txn.timestamp.split(" ")[0]}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>
                                {txn.noOfShareAcq ? `+${txn.noOfShareAcq}` : ""}
                                {txn.noOfShareSale
                                  ? `-${txn.noOfShareSale}`
                                  : ""}{" "}
                                shares
                              </span>
                              <span
                                className={`${
                                  type === "Acquisition"
                                    ? "text-green-600"
                                    : type === "Sale"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {formatPercentage(
                                  txn.totAcqShare || txn.totSaleShare
                                )}
                              </span>
                            </div>
                            {txn.attachement && (
                              <a
                                href={txn.attachement}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-xs mt-1 inline-block hover:underline"
                              >
                                View Document
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

