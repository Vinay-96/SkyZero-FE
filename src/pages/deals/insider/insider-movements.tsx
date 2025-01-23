import HoldingsTable from "@/components/reports/insiderTrades/InsiderMovement";

export default function HoldingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shareholding Changes
      </h1>
      <HoldingsTable />
    </div>
  );
}
