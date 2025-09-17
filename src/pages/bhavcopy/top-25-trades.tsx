import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api/services/api.service"

type Mover = {
  SECURITY: string
  percentChange: number
}

type Traded = {
  SECURITY: string
  NET_TRDQTY?: number
  NET_TRDVAL?: number
}

interface RootPayload {
  message: string
  data: {
    totalSecurities: number
    totalTradedQuantity: number
    totalTradedValue: number
    averageTradedQuantity: number
    averageTradedValue: number
    highestTradedQuantity: Traded
    lowestTradedQuantity: Traded
    highestTradedValue: Traded
    lowestTradedValue: Traded
    topGainers: Mover[]
    topLosers: Mover[]
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)
}

function formatPct(pct: number) {
  const fixed = Math.abs(pct).toFixed(2)
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : ""
  return `${sign}${fixed}%`
}

function Pct({ value }: { value: number }) {
  const color = value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-muted-foreground"
  return <span className={color}>{formatPct(value)}</span>
}

export default function MarketOverviewPage() {
  const [payload, setPayload] = React.useState<RootPayload | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await apiService.bhavcopy.getTop25Trades()
        setPayload(res)
      } catch (err) {
        console.error(err)
        setError("Failed to load market overview")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading market overview...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>
  }

  if (!payload) return null

  const {
    totalSecurities,
    totalTradedQuantity,
    totalTradedValue,
    averageTradedQuantity,
    averageTradedValue,
    highestTradedQuantity,
    lowestTradedQuantity,
    highestTradedValue,
    lowestTradedValue,
    topGainers,
    topLosers,
  } = payload.data

  return (
    <div className="space-y-6 p-4">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Securities" value={totalSecurities.toString()} />
        <SummaryCard title="Total Traded Qty" value={formatNumber(totalTradedQuantity)} hint="All securities combined" />
        <SummaryCard title="Total Traded Value" value={`₹${formatNumber(totalTradedValue)}`} />
        <SummaryCard
          title="Avg Traded (Qty / Value)"
          value={`${formatNumber(averageTradedQuantity)} / ₹${formatNumber(averageTradedValue)}`}
        />
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Highest Qty"
          value={highestTradedQuantity.SECURITY}
          hint={formatNumber(highestTradedQuantity.NET_TRDQTY!)}
        />
        <SummaryCard
          title="Lowest Qty"
          value={lowestTradedQuantity.SECURITY}
          hint={formatNumber(lowestTradedQuantity.NET_TRDQTY!)}
        />
        <SummaryCard
          title="Highest Value"
          value={highestTradedValue.SECURITY}
          hint={`₹${formatNumber(highestTradedValue.NET_TRDVAL!)}`}
        />
        <SummaryCard
          title="Lowest Value"
          value={lowestTradedValue.SECURITY}
          hint={`₹${formatNumber(lowestTradedValue.NET_TRDVAL!)}`}
        />
      </div>

      {/* Movers */}
      <Tabs defaultValue="gainers" className="w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Market Movers</h2>
            <p className="text-sm text-muted-foreground">{payload.message}</p>
          </div>
          <TabsList>
            <TabsTrigger value="gainers">Gainers</TabsTrigger>
            <TabsTrigger value="losers">Losers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="gainers">
          <TopList title="Top Gainers" items={topGainers} positive />
        </TabsContent>

        <TabsContent value="losers">
          <TopList title="Top Losers" items={topLosers} positive={false} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="pt-2">
          <span className="text-sm text-muted-foreground">{hint}</span>
        </CardContent>
      )}
    </Card>
  )
}

function TopList({ title, items, positive }: { title: string; items: Mover[]; positive: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={positive ? "default" : "destructive"}>{positive ? "Gainers" : "Losers"}</Badge>
        </div>
        <CardDescription>Based on percent change</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Security</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((m) => (
              <TableRow key={m.SECURITY}>
                <TableCell className="font-medium">{m.SECURITY}</TableCell>
                <TableCell className="text-right"><Pct value={m.percentChange} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
