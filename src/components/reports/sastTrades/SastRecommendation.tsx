import { apiService } from "@/lib/api/services/api.service";
import { useState, useEffect } from "react";

interface Recommendation {
  company: string;
  recommendations: string[];
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.sastDeals.getRecommendation(timeFrame, params);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default function CompactRecommendations() {
  const [data, setData] = useState<Record<string, CompanyData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchTransactions("oneWeek", "SAST_data");
        console.log("====response====", response);

        if (!response) throw new Error("Failed to fetch");
        const data = await response.data;
        console.log("====setting====", data);
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRecommendationType = (text: string) => {
    if (text.includes("buy")) return "buy";
    if (text.includes("reducing") || text.includes("monitoring")) return "sell";
    return "neutral";
  };

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
    <div className="border rounded-lg bg-white">
      {data.map((item) => (
        <div key={item.company} className="border-b last:border-b-0">
          <button
            onClick={() =>
              setExpandedCompany((prev) =>
                prev === item.company ? null : item.company
              )
            }
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{item.company}</span>
              {item.recommendations.length > 0 && (
                <span className="text-sm text-gray-500">
                  {item.recommendations.length} recommendation
                  {item.recommendations.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedCompany === item.company ? "rotate-180" : ""
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

          {expandedCompany === item.company && (
            <div className="px-4 pb-3 pt-1 space-y-2">
              {item.recommendations.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No recommendations available
                </div>
              ) : (
                item.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="mt-1">
                      {getRecommendationType(rec) === "buy" && (
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      )}
                      {getRecommendationType(rec) === "sell" && (
                        <svg
                          className="w-4 h-4 text-red-600"
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
                      )}
                    </div>
                    <span
                      className={
                        getRecommendationType(rec) === "neutral"
                          ? "text-gray-600"
                          : ""
                      }
                    >
                      {rec}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

