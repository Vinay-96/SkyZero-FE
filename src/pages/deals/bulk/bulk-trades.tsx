import BulkBlockTrade from "@/components/reports/BulkBlockTrades";

export default function BulkBlockTrades() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <BulkBlockTrade />
      </div>
    </div>
  );
}

