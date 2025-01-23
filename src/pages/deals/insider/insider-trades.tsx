import StockTransactionsView from "@/components/reports/insiderTrades/InsiderTrades";

export default function StockTransactionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-2xl font-bold text-gray-900 mb-6">
        <StockTransactionsView />
      </div>
    </div>
  );
}

