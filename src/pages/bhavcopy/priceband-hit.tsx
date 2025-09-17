import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { apiService } from "@/lib/api/services/api.service"

interface PriceBandItem {
  SYMBOL: string
  SERIES: string
  SECURITY: string
  "HIGH/LOW": "H" | "L"
}

interface SectionBlock {
  data: PriceBandItem[]
  series: string[]
}

interface RootPayload {
  message: string
  data: {
    high: SectionBlock
    low: SectionBlock
    both: SectionBlock
  }
}

const normalize = (v: string) => v.toLowerCase()

const PriceBandHitPage: React.FC = () => {
  const [payload, setPayload] = React.useState<RootPayload | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [active, setActive] = React.useState<keyof RootPayload["data"]>("high")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await apiService.bhavcopy.getPriceBandHit()
        setPayload(res)
        const keys = Object.keys(res.data) as Array<keyof RootPayload["data"]>
        if (keys.length > 0) setActive(keys[0])
      } catch (err) {
        console.error(err)
        setError("Failed to load Price Band Hits")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleTabChange = (value: string) => setActive(value as keyof RootPayload["data"])

  const filterItem = (item: PriceBandItem) => {
    if (!search.trim()) return true
    const q = normalize(search)
    return (
      item.SYMBOL.toLowerCase().includes(q) ||
      item.SECURITY.toLowerCase().includes(q) ||
      item.SERIES.toLowerCase().includes(q)
    )
  }

  const groupBySeries = (items: PriceBandItem[]) => {
    const map: Record<string, PriceBandItem[]> = {}
    for (const it of items) {
      const key = it.SERIES || "-"
      if (!map[key]) map[key] = []
      map[key].push(it)
    }
    return map
  }

  const renderSeriesCard = (seriesName: string, items: PriceBandItem[], showHLColumn: boolean) => {
    const filtered = items.filter(filterItem)
    return (
      <Card key={seriesName} className="hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Badge variant="secondary">{seriesName}</Badge>
              <span>Series</span>
            </span>
            <Badge>{filtered.length}/{items.length}</Badge>
          </CardTitle>
          <CardDescription>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No items match your search.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Security</TableHead>
                  {showHLColumn && <TableHead>Type</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{entry.SYMBOL}</TableCell>
                    <TableCell className="max-w-[420px] truncate" title={entry.SECURITY}>
                      {entry.SECURITY}
                    </TableCell>
                    {showHLColumn && (
                      <TableCell>
                        {entry["HIGH/LOW"] === "H" ? (
                          <Badge variant="default">High</Badge>
                        ) : (
                          <Badge variant="destructive">Low</Badge>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderGroup = (key: keyof RootPayload["data"]) => {
    const block = payload?.data[key]
    if (!block) return null
    const showHL = key === "both"
    const grouped = groupBySeries(block.data)
    const seriesNames = block.series
    const total = block.data.length
    return (
      <TabsContent key={key} value={key}>
        <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {total} total entries • {seriesNames.length} series
          </div>
          <div className="hidden md:block">
            <div className="flex flex-wrap gap-2">
              {seriesNames.map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {seriesNames.map((s) => renderSeriesCard(s, grouped[s] ?? [], showHL))}
        </div>
      </TabsContent>
    )
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading Price Band Hits...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>
  }

  if (!payload) {
    return null
  }

  const groups = payload.data
  const groupKeys = Object.keys(groups) as Array<keyof RootPayload["data"]>

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Band Hits</h1>
          <p className="text-sm text-muted-foreground">{payload.message}</p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by symbol, security, or series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={active} onValueChange={handleTabChange}>
        <TabsList className="mb-4 flex flex-wrap gap-2">
          {groupKeys.map((key) => {
            const total = groups[key].data.length
            return (
              <TabsTrigger key={key} value={key} className="capitalize">
                <span className="mr-2">{key}</span>
                <Badge variant="outline">{total}</Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {groupKeys.map((key) => renderGroup(key))}
      </Tabs>
    </div>
  )
}

export default PriceBandHitPage
