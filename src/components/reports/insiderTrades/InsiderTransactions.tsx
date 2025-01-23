import { apiService } from "@/lib/api/services/api.service";
import { useEffect, useState } from "react";

interface TransactionCategory {
  totalTransactions: number;
  totalSecuritiesAcquired: number;
  companies: Record<string, number>;
  persons: Record<string, number>;
}

interface TransactionData {
  [key: string]: TransactionCategory;
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.insiderDeals.getRecentActivity(
      timeFrame,
      params
    );
    console.log(response);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function TransactionDashboard() {
  const [data, setData] = useState<TransactionData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<{
    category: string;
    type: "companies" | "persons";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTransactions("oneWeek", "insider_data");
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

  const toggleSection = (category: string, type: "companies" | "persons") => {
    setExpandedSection((prev) =>
      prev?.category === category && prev.type === type
        ? null
        : { category, type }
    );
  };

  const formatNumber = (num: number) => num.toLocaleString("en-IN");

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
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Transaction Analysis Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(data).map(([category, details]) => (
          <div
            key={category}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold truncate" title={category}>
                {category}
              </h2>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span>Total Transactions</span>
                <span className="font-medium">{details.totalTransactions}</span>
              </div>

              <div className="flex justify-between">
                <span>Total Securities</span>
                <span className="font-medium">
                  {formatNumber(details.totalSecuritiesAcquired)}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => toggleSection(category, "companies")}
                  className="w-full text-left flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <span>
                    Companies ({Object.keys(details.companies).length})
                  </span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSection?.category === category &&
                      expandedSection.type === "companies"
                        ? "rotate-180"
                        : ""
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

                {expandedSection?.category === category &&
                  expandedSection.type === "companies" && (
                    <div className="bg-gray-50 p-2 rounded max-h-48 overflow-y-auto">
                      {Object.entries(details.companies).map(
                        ([name, count]) => (
                          <div
                            key={name}
                            className="flex justify-between py-1 px-2 text-sm"
                          >
                            <span className="truncate" title={name}>
                              {name}
                            </span>
                            <span className="font-medium">
                              {formatNumber(count)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => toggleSection(category, "persons")}
                  className="w-full text-left flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <span>Persons ({Object.keys(details.persons).length})</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSection?.category === category &&
                      expandedSection.type === "persons"
                        ? "rotate-180"
                        : ""
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

                {expandedSection?.category === category &&
                  expandedSection.type === "persons" && (
                    <div className="bg-gray-50 p-2 rounded max-h-48 overflow-y-auto">
                      {Object.entries(details.persons).map(([name, count]) => (
                        <div
                          key={name}
                          className="flex justify-between py-1 px-2 text-sm"
                        >
                          <span className="truncate" title={name}>
                            {name}
                          </span>
                          <span className="font-medium">
                            {formatNumber(count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

