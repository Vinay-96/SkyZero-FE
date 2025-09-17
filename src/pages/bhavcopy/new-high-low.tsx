"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api/services/api.service";

// Types
type Mover = {
  SECURITY: string;
  NEW: string;
  PREVIOUS: string;
  NEW_STATUS: "H" | "L";
  percentChange: number;
};

type JsonData = {
  message: string;
  data: {
    totalHighs: number;
    totalLows: number;
    allHighs: Mover[];
    allLows: Mover[];
    topHighs: Mover[];
    topLows: Mover[];
    highestMover: Mover;
    lowestMover: Mover;
  };
};

type Bucket = {
  label: string;
  min?: number;
  max?: number;
};

const POSITIVE_BUCKETS: Bucket[] = [
  { label: "+10% and above", min: 10 },
  { label: "+5% to +10%", min: 5, max: 10 },
  { label: "+2% to +5%", min: 2, max: 5 },
  { label: "0% to +2%", min: 0, max: 2 },
];

const NEGATIVE_BUCKETS: Bucket[] = [
  { label: "-10% and below", max: -10 },
  { label: "-10% to -5%", min: -10, max: -5 },
  { label: "-5% to -2%", min: -5, max: -2 },
  { label: "-2% to 0%", min: -2, max: 0 },
];

// Helpers
function filterByBucket(items: Mover[], bucket: Bucket, positive: boolean) {
  return items.filter((m) => {
    const pct = m.percentChange;
    if (positive) {
      const withinMin = bucket.min === undefined ? true : pct >= bucket.min;
      const withinMax = bucket.max === undefined ? true : pct < bucket.max;
      return pct >= 0 && withinMin && withinMax;
    } else {
      const withinMin = bucket.min === undefined ? true : pct >= bucket.min;
      const withinMax = bucket.max === undefined ? true : pct < bucket.max;
      return pct <= 0 && withinMin && withinMax;
    }
  });
}

function formatPct(pct: number) {
  const fixed = Math.abs(pct).toFixed(2);
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : "";
  return `${sign}${fixed}%`;
}

function Pct({ value }: { value: number }) {
  const color = value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-muted-foreground";
  return <span className={color}>{formatPct(value)}</span>;
}

export default function NewHighLowPage() {
  const [data, setData] = useState<JsonData["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiService.bhavcopy.getNewHighLow();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load new highs & lows");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const highsByBucket = useMemo(() => {
    return data ? POSITIVE_BUCKETS.map((b) => ({ bucket: b, items: filterByBucket(data.allHighs, b, true) })) : [];
  }, [data]);

  const lowsByBucket = useMemo(() => {
    return data ? NEGATIVE_BUCKETS.map((b) => ({ bucket: b, items: filterByBucket(data.allLows, b, false) })) : [];
  }, [data]);

  if (loading) return <div className="p-6 text-center text-muted-foreground">Loading highs & lows...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const { totalHighs, totalLows, topHighs, topLows, highestMover, lowestMover } = data;

  return (
    <div className="space-y-6 p-4">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Highs" value={totalHighs.toString()} hint="Count of new highs today" badge="H" />
        <SummaryCard title="Total Lows" value={totalLows.toString()} hint="Count of new lows today" badge="L" />
        <SummaryCard
          title="Highest Mover"
          value={highestMover.SECURITY}
          hint={`${highestMover.NEW} vs ${highestMover.PREVIOUS}`}
          right={<Pct value={highestMover.percentChange} />}
        />
        <SummaryCard
          title="Lowest Mover"
          value={lowestMover.SECURITY}
          hint={`${lowestMover.NEW} vs ${lowestMover.PREVIOUS}`}
          right={<Pct value={lowestMover.percentChange} />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="highs" className="w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">New Highs vs Lows</h2>
            <p className="text-sm text-muted-foreground">Grouped by percent change buckets for quick decisions.</p>
          </div>
          <TabsList>
            <TabsTrigger value="highs">Highs</TabsTrigger>
            <TabsTrigger value="lows">Lows</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="highs">
          <BucketGrid groups={highsByBucket} status="H" />
          <div className="mt-6">
            <TopList title="Top Highs" items={topHighs} status="H" />
          </div>
        </TabsContent>

        <TabsContent value="lows">
          <BucketGrid groups={lowsByBucket} status="L" />
          <div className="mt-6">
            <TopList title="Top Lows" items={topLows} status="L" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Components
function SummaryCard({
  title,
  value,
  hint,
  badge,
  right,
}: {
  title: string;
  value: string;
  hint?: string;
  badge?: "H" | "L";
  right?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-2xl">{value}</CardTitle>
          {right}
        </div>
      </CardHeader>
      {!!hint || !!badge ? (
        <CardContent className="pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {badge && (
              <Badge variant={badge === "H" ? "default" : "destructive"}>{badge === "H" ? "High" : "Low"}</Badge>
            )}
            {hint && <span>{hint}</span>}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function BucketGrid({
  groups,
  status,
}: {
  groups: { bucket: Bucket; items: Mover[] }[];
  status: "H" | "L";
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
      {groups.map(({ bucket, items }) => (
        <Card key={bucket.label}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{bucket.label}</CardTitle>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <CardDescription>{status === "H" ? "Gainers in bucket" : "Losers in bucket"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Security</TableHead>
                  <TableHead className="text-right">Prev</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No records in this bucket
                    </TableCell>
                  </TableRow>
                ) : (
                  items
                    .slice()
                    .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
                    .map((m) => (
                      <TableRow key={`${m.SECURITY}-${m.NEW}-${m.PREVIOUS}`}>
                        <TableCell className="font-medium">{m.SECURITY}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.PREVIOUS}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.NEW}</TableCell>
                        <TableCell className="text-right">
                          <Pct value={m.percentChange} />
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TopList({ title, items, status }: { title: string; items: Mover[]; status: "H" | "L" }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={status === "H" ? "default" : "destructive"}>{status === "H" ? "Highs" : "Lows"}</Badge>
        </div>
        <CardDescription>Top movers snapshot</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Security</TableHead>
              <TableHead className="text-right">Prev</TableHead>
              <TableHead className="text-right">New</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((m) => (
              <TableRow key={`${m.SECURITY}-${m.NEW}-${m.PREVIOUS}`}>
                <TableCell className="font-medium">{m.SECURITY}</TableCell>
                <TableCell className="text-right tabular-nums">{m.PREVIOUS}</TableCell>
                <TableCell className="text-right tabular-nums">{m.NEW}</TableCell>
                <TableCell className="text-right">
                  <Pct value={m.percentChange} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
