import CompactRecommendations from "@/components/reports/sastTrades/SastRecommendation";

export default function RecommendationsPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Investment Recommendations</h2>
      <CompactRecommendations />
    </div>
  );
}
