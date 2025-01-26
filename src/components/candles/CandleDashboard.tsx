import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "../ui/progress";
import { Card } from "../ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { ChevronDown, Clock } from "lucide-react";

interface AnalysisData {
  intraday: any;
  historical: any;
}

interface MarketAnalysisProps {
  data: AnalysisData;
}

export default function MarketAnalysisDashboard({ data }: MarketAnalysisProps) {
  const [expandedSections] = useState({
    intradayTrend: true,
    intradaySignals: true,
    historicalKeyLevels: false,
  });

  const renderAnalysisSection = (sectionData: any, isIntraday: boolean) => (
    <Card className="p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {isIntraday ? (
            <>
              <span className="text-emerald-500">📈</span>
              Real-time Intraday Analysis
            </>
          ) : (
            <>
              <span className="text-blue-500">📊</span>
              Historical Analysis
            </>
          )}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleString()}
        </div>
      </div>

      <CollapsibleSection title="📊 Trend & Strength Analysis" defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TrendOverview data={sectionData} />
          <StrengthAnalysis data={sectionData} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🔔 Signals & Breakouts" defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SignalSection
            signals={sectionData.analysisWithoutTrendlines.signals}
          />
          <div className="space-y-6">
            <BreakoutAlerts
              breakouts={sectionData.analysisWithoutTrendlines.breakouts}
            />
            <TrendlineSignals signals={sectionData.trendLineAnalysis.signals} />
            <EarlySignals
              signals={sectionData.trendLineAnalysis.earlySignals}
            />
          </div>
        </div>
      </CollapsibleSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TechnicalInsights data={sectionData} />
        <PredictionInsights
          predictions={sectionData.trendLineAnalysis.prediction}
        />
        <MarketWarnings warnings={sectionData.trendLineAnalysis.warnings} />
      </div>

      <CollapsibleSection title="🔮 Predictions" defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PredictionInsights
            predictions={sectionData.trendLineAnalysis.prediction}
          />
          <PatternPredictions
            patterns={sectionData.trendLineAnalysis.prediction.patterns}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="🔑 Key Levels" defaultOpen>
        <div className="space-y-6">
          <KeyLevels data={sectionData} />
          <StrongLevels
            levels={sectionData.trendLineAnalysis.strength.strongLevels}
          />
        </div>
      </CollapsibleSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SwingPoints
          data={
            sectionData.analysisWithoutTrendlines.technicalDetails
              .recentSwingPoints
          }
        />
        <PatternAnalysis
          patterns={
            sectionData.analysisWithoutTrendlines.technicalDetails.patterns
          }
        />
      </div>
    </Card>
  );

  return (
    <div className="grid gap-4 p-4 h-auto">
      {renderAnalysisSection(data.intraday, true)}
      {renderAnalysisSection(data.historical, false)}
    </div>
  );
}

// Helper Components
const CollapsibleSection = ({ title, children, defaultOpen = true }: any) => (
  <Collapsible defaultOpen={defaultOpen}>
    <CollapsibleTrigger className="w-full">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-t-lg hover:bg-muted/70 transition-colors">
        <h4 className="font-semibold text-lg">{title}</h4>
        <ChevronDown className="w-5 h-5 transition-transform" />
      </div>
    </CollapsibleTrigger>
    <CollapsibleContent className="border-x border-b rounded-b-lg p-4 bg-background">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

const TrendOverview = ({ data }: any) => {
  const calculateCandleStrength = (priceStructure: any) => {
    // Custom formula - adjust weights according to your needs
    const { bodyStrength, rangeStrength, wickSignificance } = priceStructure;
    return Math.min(
      bodyStrength * 0.6 + // Give body strength highest weight
        rangeStrength * 0.3 + // Range strength moderate weight
        (1 - wickSignificance) * 0.1, // Lower wick significance is better
      100
    ); // Cap at 100%
  };

  const candleStrength = calculateCandleStrength(
    data.analysisWithoutTrendlines.technicalDetails.priceStructure
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <TrendIndicator
          label="Market Trend"
          value={data.analysisWithoutTrendlines.marketStructure.trend}
          strength={
            data.analysisWithoutTrendlines.marketStructure.trendStrength
          }
        />
        <TrendIndicator
          label="Primary Trend"
          value={data.trendLineAnalysis.trend.primary}
          strength={data.trendLineAnalysis.strength.avgStrength.support.toFixed(
            2
          )}
        />
        <TrendIndicator
          label="Candle Strength"
          value={
            data.analysisWithoutTrendlines.technicalDetails.priceStructure
              .candleType
          }
          strength={`${candleStrength.toFixed(1)}%`}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <MetricValue
          label="Resistance Slope"
          value={data.trendLineAnalysis.trend.slope.resistance?.toFixed(2)}
          delta={data.trendLineAnalysis.strength.momentum.resistance * 100}
        />
        <MetricValue
          label="Support Slope"
          value={data.trendLineAnalysis.trend.slope.support?.toFixed(2)}
          delta={data.trendLineAnalysis.strength.momentum.support * 100}
        />
      </div>
    </div>
  );
};

const TrendIndicator = ({ label, value, strength }: any) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
    <div
      className={`w-3 h-3 rounded-full ${
        value === "Uptrend" ? "bg-emerald-500" : "bg-rose-500"
      }`}
    />
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">
        {typeof strength === "string" ? strength : `Strength: ${strength}`}
      </div>
    </div>
  </div>
);

const StrengthAnalysis = ({ data }: any) => (
  <div className="space-y-6">
    <StrengthMeter
      label="Resistance"
      touchpoints={data.trendLineAnalysis.strength.touchpoints.resistance}
      avgStrength={data.trendLineAnalysis.strength.avgStrength.resistance * 100}
      momentum={data.trendLineAnalysis.strength.momentum.resistance * 100}
    />
    <StrengthMeter
      label="Support"
      touchpoints={data.trendLineAnalysis.strength.touchpoints.support}
      avgStrength={data.trendLineAnalysis.strength.avgStrength.support * 100}
      momentum={data.trendLineAnalysis.strength.momentum.support * 100}
    />
  </div>
);

const StrengthMeter = ({ label, touchpoints, avgStrength, momentum }: any) => (
  <div className="border p-4 rounded-xl bg-gradient-to-b from-background to-muted/20">
    <div className="flex justify-between items-center mb-3">
      <span className="font-medium">{label}</span>
      <Badge variant="outline" className="bg-background">
        {touchpoints} touchpoints
      </Badge>
    </div>
    <div className="space-y-4">
      <ProgressIndicator label="Avg Strength" value={avgStrength} />
      <ProgressIndicator label="Momentum" value={momentum} />
    </div>
  </div>
);

const ProgressIndicator = ({ label, value }: any) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span>{value.toFixed(1)}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

const SignalSection = ({ signals }: any) => (
  <div className="space-y-4">
    <SignalGroup title="Momentum Signals" signals={signals.momentumSignals} />
    <SignalGroup title="Pattern Signals" signals={signals.patternSignals} />
    <SignalGroup
      title="Swing Point Signals"
      signals={signals.swingPointSignals}
    />
    <SignalGroup title="Trendline Signals" signals={signals.trendlineSignals} />
    <SignalGroup
      title="Market Structure"
      signals={signals.marketStructureSignals}
    />
  </div>
);

const SignalGroup = ({ title, signals }: any) =>
  signals.length > 0 && (
    <div>
      <h4 className="font-medium mb-2">{title}</h4>
      <div className="space-y-2">
        {signals.map((signal: any) => (
          <SignalAlert key={signal.reason} {...signal} />
        ))}
      </div>
    </div>
  );

const SignalAlert = ({ type, reason, confidence, strength }: any) => (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full" />
      <div>
        <div className="font-medium">{type}</div>
        <div className="text-sm text-muted-foreground">{reason}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="text-xs">
        {confidence}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {strength?.toFixed(1)}
      </span>
    </div>
  </div>
);

const BreakoutAlerts = ({ breakouts }: any) =>
  breakouts.length > 0 && (
    <div>
      <h4 className="font-medium mb-2">⛓️ Breakout Alerts</h4>
      <div className="space-y-2">
        {breakouts.map((breakout: any) => (
          <BreakoutAlert key={breakout.timestamp} {...breakout} />
        ))}
      </div>
    </div>
  );

const EarlySignals = ({ signals }: any) =>
  signals.length > 0 && (
    <div>
      <h4 className="font-medium mb-2">🔍 Early Signals</h4>
      <div className="space-y-2">
        {signals.map((signal: string) => (
          <div
            key={signal}
            className="p-2 bg-amber-50 border border-amber-200 rounded flex items-center gap-2"
          >
            <span className="text-amber-500">⚠️</span>
            <span className="text-sm">{signal}</span>
          </div>
        ))}
      </div>
    </div>
  );

const TechnicalInsights = ({ data }: any) => (
  <div className="space-y-4">
    <TechIndicatorCard
      title="Momentum"
      data={data.trendLineAnalysis.techindicators.momentum}
    />
    <TechIndicatorCard
      title="Volatility"
      data={data.trendLineAnalysis.techindicators.volatility}
    />
    <TechIndicatorCard
      title="Trend"
      data={data.trendLineAnalysis.techindicators.trend}
    />
    <TechIndicatorCard
      title="Strong Key Levels"
      data={data.trendLineAnalysis.keyLevels}
    />
  </div>
);

const TechIndicatorCard = ({ title, data }: any) => (
  <div className="border p-3 rounded-lg bg-muted/20">
    <div className="font-medium mb-2">{title}</div>
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex justify-between text-sm py-1">
        <span className="capitalize text-muted-foreground">{key}:</span>
        <span className="font-medium">{value as string}</span>
      </div>
    ))}
  </div>
);

const PredictionInsights = ({ predictions }: any) => (
  <div className="space-y-4">
    <PredictionCard title="Basic Forecast" data={predictions.basic} />
    <PredictionCard title="Advanced Forecast" data={predictions.advanced} />
  </div>
);

const PredictionCard = ({ title, data }: any) => (
  <div className="border p-3 rounded-lg bg-muted/20">
    <div className="font-medium mb-2">{title}</div>
    {Object.entries(data).map(([key, value]) => (
      <div key={key} className="text-sm py-1">
        <div className="text-muted-foreground capitalize">{key}:</div>
        {typeof value === "object" ? (
          <div className="pl-2">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="flex justify-between">
                <span className="text-muted-foreground">{subKey}:</span>
                <span className="font-medium">{subValue as string}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="font-medium">{value as string}</div>
        )}
      </div>
    ))}
  </div>
);

const MarketWarnings = ({ warnings }: any) => (
  <div className="space-y-3">
    {warnings.critical.map((msg: string) => (
      <div
        key={msg}
        className="p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2"
      >
        <span className="text-red-500">⛔</span>
        <span className="text-sm">{msg}</span>
      </div>
    ))}
    {warnings.moderate.map((msg: string) => (
      <div
        key={msg}
        className="p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2"
      >
        <span className="text-yellow-500">⚠️</span>
        <span className="text-sm">{msg}</span>
      </div>
    ))}
    {warnings.observational.map((msg: string) => (
      <div
        key={msg}
        className="p-2 bg-grey-50 border border-grey-200 rounded flex items-center gap-2"
      >
        <span className="text-grey-500">👁️</span>
        <span className="text-sm">{msg}</span>
      </div>
    ))}
  </div>
);

const KeyLevels = ({ data }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="space-y-2">
      <h4 className="font-medium text-emerald-600">Support Levels</h4>
      <div className="flex flex-wrap gap-2">
        {data.analysisWithoutTrendlines.keyLevels
          .filter((level: any) => level.type === "Support")
          .map((level: any) => (
            <LevelPill key={level.price} {...level} />
          ))}
      </div>
    </div>
    <div className="space-y-2">
      <h4 className="font-medium text-rose-600">Resistance Levels</h4>
      <div className="flex flex-wrap gap-2">
        {data.analysisWithoutTrendlines.keyLevels
          .filter((level: any) => level.type === "Resistance")
          .map((level: any) => (
            <LevelPill key={level.price} {...level} />
          ))}
      </div>
    </div>
  </div>
);

const LevelPill = ({ type, price, testCount }: any) => (
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium ${
      type === "Support"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-rose-100 text-rose-800"
    }`}
  >
    {price.toFixed(2)} ({testCount}x)
  </span>
);

const SwingPoints = ({ data }: any) => (
  <div className="space-y-2">
    {data.map((swing: any) => (
      <SwingPointIndicator key={swing.timestamp} {...swing} />
    ))}
  </div>
);

const SwingPointIndicator = ({ type, price, timestamp, strength }: any) => (
  <div className="p-3 border rounded-lg flex items-center justify-between bg-muted/20">
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          type === "low" ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      <div>
        <div className="font-medium">${price.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
    <Badge variant="secondary">Strength: {strength}</Badge>
  </div>
);

const PatternAnalysis = ({ patterns }: any) => (
  <div className="space-y-2">
    {patterns.map((pattern: any) => (
      <PatternIndicator key={pattern.type} {...pattern} />
    ))}
  </div>
);

const PatternIndicator = ({ type, significance, bias }: any) => (
  <div className="p-3 border rounded-lg flex items-center gap-2 bg-muted/20">
    <div
      className={`w-2 h-2 rounded-full ${
        bias === "Bullish" ? "bg-emerald-500" : "bg-rose-500"
      }`}
    />
    <div>
      <div className="font-medium">{type}</div>
      <div className="text-sm text-muted-foreground">
        {bias} - {significance.toFixed(1)} Significance
      </div>
    </div>
  </div>
);

const MetricValue = ({ label, value, delta }: any) => (
  <div className="bg-muted/50 p-3 rounded-lg">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="font-medium flex items-center gap-2">
      {value}
      {delta && (
        <span
          className={`text-sm ${
            delta > 0 ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          ({delta > 0 ? "+" : ""}
          {delta.toFixed(1)}%)
        </span>
      )}
    </div>
  </div>
);

const BreakoutAlert = ({ type, price, timestamp }: any) => (
  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-purple-500 rounded-full" />
      <div>
        <div className="font-medium">{type}</div>
        <div className="text-sm text-muted-foreground">${price}</div>
      </div>
    </div>
    <div className="text-sm text-muted-foreground">
      {new Date(timestamp).toLocaleTimeString()}
    </div>
  </div>
);

const PatternPredictions = ({ patterns }: { patterns: any }) => (
  <div className="border rounded-xl p-4 bg-muted/20">
    <h4 className="font-semibold text-lg mb-4">📈 Price Patterns</h4>
    <div className="grid grid-cols-1 gap-4">
      {patterns.bullish.length > 0 && (
        <PatternGroup type="bullish" color="emerald" items={patterns.bullish} />
      )}
      {patterns.bearish.length > 0 && (
        <PatternGroup type="bearish" color="rose" items={patterns.bearish} />
      )}
      {patterns.neutral.length > 0 && (
        <PatternGroup type="neutral" color="gray" items={patterns.neutral} />
      )}
    </div>
  </div>
);

const PatternGroup = ({ type, color, items }: any) => (
  <div className={`border-l-4 border-${color}--500 pl-3`}>
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-${color}-500 font-medium`}>
        {type.charAt(0).toUpperCase() + type.slice(1)} Patterns
      </span>
      <Badge variant="outline" className={`bg-${color}-100 text-${color}-800`}>
        {items.length} detected
      </Badge>
    </div>
    <div className="grid grid-cols-1 gap-2">
      {items.map((pattern: any, index: number) => (
        <div key={index} className="p-2 rounded-lg bg-background border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`text-${color}-500`}>
                {type === "bullish" ? "📈" : type === "bearish" ? "📉" : "➖"}
              </span>
              <span className="font-medium">{pattern.pattern}</span>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mr-2">
                {pattern.reliability}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Target: +${pattern.targetDistance.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TrendlineSignals = ({ signals }: { signals: any[] }) => {
  if (!signals.length) return null;

  return (
    <div className="border rounded-xl p-4 bg-muted/20">
      <h4 className="font-semibold text-lg mb-4">🚦 Trendline Signals</h4>
      <div className="space-y-3">
        {signals.map((signal, index) => (
          <div key={index} className="p-3 rounded-lg bg-background border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    signal.type.includes("Bullish")
                      ? "bg-emerald-500"
                      : signal.type.includes("Bearish")
                      ? "bg-rose-500"
                      : "bg-gray-500"
                  }`}
                />
                <div>
                  <div className="font-medium">{signal.type}</div>
                  <div className="text-sm text-muted-foreground">
                    Triggered @ {signal.price.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {new Date(signal.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StrongLevels = ({
  levels,
}: {
  levels: { resistance: number[]; support: number[] };
}) => {
  const totalLevels = levels.resistance.length + levels.support.length;
  if (totalLevels === 0) return null;

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-t-lg hover:bg-muted/70 transition-colors">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">💪 Strong Levels</h4>
            <Badge variant="outline" className="px-1.5 py-0 text-xs">
              {totalLevels}
            </Badge>
          </div>
          <ChevronDown className="w-4 h-4" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="border-x border-b rounded-b-lg p-2 bg-background space-y-3">
        {levels.resistance.length > 0 && (
          <div className="max-w-[100vw]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-rose-600 text-xs font-medium">
                Resistance
              </span>
              <Badge variant="destructive" className="px-1.5 py-0 h-4 text-xs">
                {levels.resistance.length}
              </Badge>
            </div>
            <div className="grid grid-flow-col auto-cols-max gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {levels.resistance.map((level, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-medium whitespace-nowrap"
                >
                  ${level.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}

        {levels.support.length > 0 && (
          <div className="max-w-[100vw]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-emerald-600 text-xs font-medium">
                Support
              </span>
              <Badge variant="success" className="px-1.5 py-0 h-4 text-xs">
                {levels.support.length}
              </Badge>
            </div>
            <div className="grid grid-flow-col auto-cols-max gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {levels.support.map((level, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium whitespace-nowrap"
                >
                  ${level.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
