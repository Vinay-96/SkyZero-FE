// components/SignalsUI.tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type Signal = {
  strikePrice: number;
  type: string;
  action: string;
  highConfidence: boolean;
  timestamp: string; // Added timestamp field
  details: {
    pcr: string;
    pcrThreshold: string;
    ivSpread: string;
    callPOP: number;
    callOiChange: string;
    putOiChange: string;
    currentOiRatio: string;
    previousOiRatio: string;
  };
  reason: string[];
};

export type MarketAverages = {
  averagePCR: number;
  averageIVDiff: number;
};

export type AnalysisData = {
  marketAverages: MarketAverages;
  signals: Signal[];
  timestamp: string; // Timestamp for market overview
};

interface SignalsUIProps {
  data: AnalysisData;
}

function SignalCard({ signal }: { signal: Signal }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold text-gray-800">
            <span
              className={`mr-2 ${
                signal.type === "Call" ? "text-green-600" : "text-red-600"
              }`}
            >
              {signal.type}
            </span>
            <span className="text-blue-600">{signal.action}</span> -
            <span className="text-purple-600 ml-1">₹{signal.strikePrice}</span>
          </CardTitle>
        </div>
        <Badge
          className={
            signal.highConfidence
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
          }
        >
          {signal.highConfidence ? "High Confidence" : "Low Confidence"}
        </Badge>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-blue-600 font-medium">PCR</div>
            <div>
              {signal.details.pcr}
              <span className="text-gray-500 text-xs ml-1">
                ({signal.details.pcrThreshold})
              </span>
            </div>
          </div>
          <div className="bg-purple-50 p-2 rounded">
            <div className="text-xs text-purple-600 font-medium">IV Spread</div>
            <div>{signal.details.ivSpread}</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xs text-green-600 font-medium">Call POP</div>
            <div>{signal.details.callPOP}%</div>
          </div>
          <div className="bg-orange-50 p-2 rounded">
            <div className="text-xs text-orange-600 font-medium">Call OI</div>
            <div>{signal.details.callOiChange}</div>
          </div>
          <div className="bg-pink-50 p-2 rounded">
            <div className="text-xs text-pink-600 font-medium">Put OI</div>
            <div>{signal.details.putOiChange}</div>
          </div>
          <div className="bg-indigo-50 p-2 rounded">
            <div className="text-xs text-indigo-600 font-medium">OI Ratio</div>
            <div>
              {signal.details.currentOiRatio}
              <span className="text-gray-500 text-xs ml-1">
                ({signal.details.previousOiRatio})
              </span>
            </div>
          </div>
        </div>
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Key Reasons
          </h4>
          <ul className="list-disc pl-5 space-y-1.5">
            {signal.reason.map((item, idx) => (
              <li key={idx} className="text-xs text-gray-600 leading-5">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignalsUI({ data }: SignalsUIProps) {
  // Calculate the number of Call and Put signals
  const callCount = data.signals.filter((signal) => signal.type === "CALL").length;
  const putCount = data.signals.filter((signal) => signal.type === "PUT").length;

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Market Overview Card */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            Market Overview
          </CardTitle>
          <div className="text-sm text-gray-500 mt-1">
            {format(new Date(data.timestamp), "MMM dd, yyyy hh:mm a")}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Avg PCR</span>
                <div className="text-2xl font-bold text-blue-600">
                  {data.marketAverages.averagePCR.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Avg IV Diff</span>
                <div className="text-2xl font-bold text-purple-600">
                  {data.marketAverages.averageIVDiff.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Call / Put Ratio</span>
                <div className="text-2xl font-bold text-indigo-600">
                  {callCount} / {putCount}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.signals.map((signal, idx) => (
          <SignalCard key={idx} signal={signal} />
        ))}
      </div>
    </div>
  );
}
