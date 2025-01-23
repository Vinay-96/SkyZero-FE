import HighWinTrades from "@/components/reports/sastTrades/SastHighProbTrades";

export default function TradesPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">High-Probability Trades</h1>
      <HighWinTrades />
    </div>
  );
}
