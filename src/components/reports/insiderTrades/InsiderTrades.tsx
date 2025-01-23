import { apiService } from "@/lib/api/services/api.service";
import React, { useState, useEffect } from "react";

interface Transaction {
  symbol: string;
  company: string;
  acqName: string;
  date: string;
  secType: string;
  acqMode: string;
  befAcqSharesNo: string;
  befAcqSharesPer: string;
  afterAcqSharesNo: string;
  afterAcqSharesPer: string;
}

interface TransactionData {
  "Market Sale": Transaction[];
  "Preferential Offer": Transaction[];
  "Market Purchase": Transaction[];
  "Off Market": Transaction[];
}

// API function for fetching trades
const fetchTransactions = async (timeFrame: string, params: string) => {
  try {
    const response = apiService.insiderDeals.getAll(timeFrame, params);
    console.log(response);
    if (!response) {
      throw new Error("Failed to fetch trades");
    }
    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

const StockTransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData | null>(
    null
  );
  const [activeTab, setActiveTab] =
    useState<keyof TransactionData>("Market Sale");

  const loadTrades = async () => {
    try {
      const data = await fetchTransactions("oneWeek", "insider_data");
      setTransactions(data.data);
    } catch (err) {
      return err.message;
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const renderTransactionTable = (transactionList: Transaction[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left font-semibold">Symbol</th>
            <th className="p-3 text-left font-semibold">Company</th>
            <th className="p-3 text-left font-semibold">Acquire Name</th>
            <th className="p-3 text-left font-semibold">Date</th>
            <th className="p-3 text-left font-semibold">Shares Before</th>
            <th className="p-3 text-left font-semibold">Shares After</th>
          </tr>
        </thead>
        <tbody>
          {transactionList.map((transaction, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3">{transaction.symbol}</td>
              <td className="p-3">{transaction.company}</td>
              <td className="p-3">{transaction.acqName}</td>
              <td className="p-3">{transaction.date}</td>
              <td className="p-3">{`${transaction.befAcqSharesNo} (${transaction.befAcqSharesPer}%)`}</td>
              <td className="p-3">{`${transaction.afterAcqSharesNo} (${transaction.afterAcqSharesPer}%)`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-200 px-6 py-4 border-b">
          <div className="flex space-x-4 mt-4">
            {transactions &&
              Object.keys(transactions).map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab as keyof TransactionData)}
                >
                  {tab}
                </button>
              ))}
          </div>
        </div>
        <div className="p-6">
          {transactions && renderTransactionTable(transactions[activeTab])}
        </div>
      </div>
    </div>
  );
};

export default StockTransactionsView;

