import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { apiService } from "@/lib/api/services/api.service"

interface ItemEntry {
  SERIES: string[]
  SYMBOL: string
  SECURITY: string
  RECORD_DT: string
  BC_STRT_DT: string
  BC_END_DT: string
  EX_DT: string
  ND_STRT_DT: string
  ND_END_DT: string
  PURPOSE: string
}

interface SubGroupsMap {
  [subGroupName: string]: ItemEntry[]
}

interface GroupBlock {
  total: number
  subGroups: SubGroupsMap
}

type DataGroups = Record<string, GroupBlock>

interface RootData {
  message: string
  data: DataGroups
}

const normalizeString = (value: string) => value.toLowerCase()

const CropActionPage: React.FC = () => {
  const [data, setData] = React.useState<RootData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [active, setActive] = React.useState<string>("")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await apiService.bhavcopy.getCropAction()
        setData(res)
        const keys = Object.keys(res.data)
        if (keys.length > 0) setActive(keys[0])
      } catch (err) {
        console.error(err)
        setError("Failed to load corporate actions")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleTabChange = (value: string) => setActive(value)

  const filterItem = (item: ItemEntry) => {
    if (!search.trim()) return true
    const q = normalizeString(search)
    return (
      item.SYMBOL.toLowerCase().includes(q) ||
      item.SECURITY.toLowerCase().includes(q) ||
      item.PURPOSE.toLowerCase().includes(q)
    )
  }

  const renderSubGroupCard = (subGroupName: string, items: ItemEntry[]) => {
    const filtered = items.filter(filterItem)
    return (
      <Card key={subGroupName} className="hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{subGroupName}</span>
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
                  <TableHead>Series</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Ex-Date</TableHead>
                  <TableHead>Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.SERIES.map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.SYMBOL}</TableCell>
                    <TableCell className="max-w-[360px] truncate" title={entry.SECURITY}>{entry.SECURITY}</TableCell>
                    <TableCell>{entry.RECORD_DT || "-"}</TableCell>
                    <TableCell>{entry.EX_DT || "-"}</TableCell>
                    <TableCell className="max-w-[280px] truncate" title={entry.PURPOSE}>{entry.PURPOSE}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading corporate actions...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>
  }

  if (!data) {
    return null
  }

  const groups = data.data
  const groupKeys = Object.keys(groups)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Corporate Actions</h1>
          <p className="text-sm text-muted-foreground">{data.message}</p>
        </div>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by symbol, security, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={active} onValueChange={handleTabChange}>
        <TabsList className="mb-4 flex flex-wrap gap-2">
          {groupKeys.map((key) => {
            const total = groups[key]?.total ?? 0
            return (
              <TabsTrigger key={key} value={key} className="capitalize">
                <span className="mr-2">{key}</span>
                <Badge variant="outline">{total}</Badge>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {groupKeys.map((key) => {
          const block = groups[key]
          const subNames = Object.keys(block.subGroups)
          const totalItems = subNames.reduce((acc, name) => acc + block.subGroups[name].length, 0)
          return (
            <TabsContent key={key} value={key}>
              <div className="mb-3 text-sm text-muted-foreground">
                {totalItems} total entries across {subNames.length} subgroup{subNames.length !== 1 ? "s" : ""}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {subNames.map((sub) => renderSubGroupCard(sub, block.subGroups[sub]))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

export default CropActionPage
