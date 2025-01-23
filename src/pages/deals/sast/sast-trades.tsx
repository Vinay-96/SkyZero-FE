import MinimalTransactions from "@/components/reports/sastTrades/SastTrades";

export default function TransactionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Corporate Transactions</h1>
      <MinimalTransactions />
    </div>
  );
}
