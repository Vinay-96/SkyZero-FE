import React from "react"
import Head from "next/head"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { apiService } from "@/lib/api/services/api.service"

// Types
type SecurityItem = {
  GAIN_LOSS: string
  SECURITY: string
  CLOSE_PRIC: string
  PREV_CL_PR: string
  PERCENT_CG: string
}

type GroupedBucket = SecurityItem[]

type GroupedData = {
  gainers: {
    upto5: GroupedBucket
    upto10: GroupedBucket
    upto20: GroupedBucket
    above: GroupedBucket
  }
  losers: {
    upto5: GroupedBucket
    upto10: GroupedBucket
    upto20: GroupedBucket
    above: GroupedBucket
  }
  unchanged: SecurityItem[]
  invalid: SecurityItem[]
}

type Summary = {
  totalSecurities: number
  validSecurities: number
  totalGainers: number
  totalLosers: number
  unchanged: number
  invalid: number
  gainersBreakdown: { upto5: number; upto10: number; upto20: number; above: number }
  losersBreakdown: { upto5: number; upto10: number; upto20: number; above: number }
  topGainers: SecurityItem[]
  topLosers: SecurityItem[]
}

type DashboardData = {
  message: string
  data: {
    groupedData: GroupedData
    summary: Summary
  }
}

const numberOrNull = (value: string): number | null => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const formatPercent = (value: string): string => {
  const num = Number(value)
  return Number.isNaN(num) ? value : `${num.toFixed(2)}%`
}

const GainersLosersPage: React.FC = () => {
  const [data, setData] = React.useState<DashboardData["data"] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [active, setActive] = React.useState<string>("gainers")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await apiService.bhavcopy.getGainersLosers()
        setData(res.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load gainers & losers")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filterItem = (item: SecurityItem) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return item.SECURITY.toLowerCase().includes(q)
  }

  const renderGroupTable = (items: SecurityItem[]) => {
    const filtered = items.filter(filterItem)
    if (!filtered.length) {
      return <div className="text-sm text-muted-foreground">No results found.</div>
    }

    return (
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Security</TableHead>
              <TableHead className="w-[20%] text-right">Prev Close</TableHead>
              <TableHead className="w-[20%] text-right">Close</TableHead>
              <TableHead className="w-[20%] text-right">Change %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row, idx) => {
              const prev = numberOrNull(row.PREV_CL_PR)
              const close = numberOrNull(row.CLOSE_PRIC)
              const isGain = row.GAIN_LOSS === "G"
              return (
                <TableRow key={`${row.SECURITY}-${idx}`}>
                  <TableCell className="font-medium">{row.SECURITY}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {prev !== null ? prev.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {close !== null ? close.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums font-medium ${
                      isGain ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatPercent(row.PERCENT_CG)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading gainers & losers...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>
  }

  if (!data) return null

  const { summary, groupedData } = data

  return (
    <>
      <Head>
        <title>Bhavcopy — Gainers & Losers</title>
      </Head>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gainers & Losers</h1>
            <p className="text-sm text-muted-foreground">
              Market breadth overview with grouped movers for quick decisions.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by security..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="mb-4 flex gap-2">
            <TabsTrigger value="gainers">
              Gainers <Badge variant="outline">{summary.totalGainers}</Badge>
            </TabsTrigger>
            <TabsTrigger value="losers">
              Losers <Badge variant="outline">{summary.totalLosers}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Up to 5%</span>
                    <Badge>{groupedData.gainers.upto5.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderGroupTable(groupedData.gainers.upto5)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Up to 10%</span>
                    <Badge>{groupedData.gainers.upto10.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderGroupTable(groupedData.gainers.upto10)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Up to 20%</span>
                    <Badge>{groupedData.gainers.upto20.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderGroupTable(groupedData.gainers.upto20)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Above 20%</span>
                    <Badge>{groupedData.gainers.above.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupedData.gainers.above.length
                    ? renderGroupTable(groupedData.gainers.above)
                    : <div className="text-sm text-muted-foreground">No gainers above 20%.</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="losers">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Up to 5%</span>
                    <Badge>{groupedData.losers.upto5.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderGroupTable(groupedData.losers.upto5)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Up to 10%</span>
                    <Badge>{groupedData.losers.upto10.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderGroupTable(groupedData.losers.upto10)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Up to 20%</span>
                    <Badge>{groupedData.losers.upto20.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderGroupTable(groupedData.losers.upto20)}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Above 20%</span>
                    <Badge>{groupedData.losers.above.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {groupedData.losers.above.length
                    ? renderGroupTable(groupedData.losers.above)
                    : <div className="text-sm text-muted-foreground">No losers above 20%.</div>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default GainersLosersPage
