import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const BulkBlockTradeCard = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasBuyTrades = data.Trades.BUY.length > 0;
  const hasSellTrades = data.Trades.SELL.length > 0;

  // Calculate average prices
  const avgBuyPrice = hasBuyTrades
    ? data.Trades.BUY.reduce((acc, trade) => acc + trade.BD_TP_WATP, 0) /
      data.Trades.BUY.length
    : 0;
  const avgSellPrice = hasSellTrades
    ? data.Trades.SELL.reduce((acc, trade) => acc + trade.BD_TP_WATP, 0) /
      data.Trades.SELL.length
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.Symbol}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.SecurityName}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Trade Summary */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Buy Trades
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {data.Trades.BUY.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sell Trades
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {data.Trades.SELL.length}
                </p>
              </div>
            </div>
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Average Prices */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-750">
            {hasBuyTrades && (
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Avg Buy Price
                  </p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    ₹{avgBuyPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
            {hasSellTrades && (
              <div className="flex items-center space-x-2">
                <ArrowDownRight className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Avg Sell Price
                  </p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    ₹{avgSellPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Trade Details */}
          <div className="p-4">
            {/* Buy Trades */}
            {hasBuyTrades && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Buy Trades
                </h4>
                <div className="space-y-2">
                  {data.Trades.BUY.map((trade) => (
                    <div
                      key={trade._id}
                      className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {trade.BD_CLIENT_NAME}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {trade.mTIMESTAMP}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ₹{trade.BD_TP_WATP.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sell Trades */}
            {hasSellTrades && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Sell Trades
                </h4>
                <div className="space-y-2">
                  {data.Trades.SELL.map((trade) => (
                    <div
                      key={trade._id}
                      className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {trade.BD_CLIENT_NAME}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {trade.mTIMESTAMP}
                          </p>
                        </div>
                        <p className="font-semibold text-red-600 dark:text-red-400">
                          ₹{trade.BD_TP_WATP.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TradeDashboard = ({ trades }) => {
  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      {trades.data.map((tradeData) => (
        <BulkBlockTradeCard key={tradeData.Symbol} data={tradeData} />
      ))}
    </div>
  );
};

export default TradeDashboard;

