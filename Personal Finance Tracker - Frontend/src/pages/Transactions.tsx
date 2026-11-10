import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  PaperclipIcon,
} from "lucide-react"
import { EntryFormDialog, typeItems } from "@/components/EntryFormDialog"
import { ReceiptViewer } from "@/components/ReceiptViewer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api, type Entry, type EntriesPage, type EntriesQuery, type EntryInput } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { useMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const filterTypeItems = [{ label: "All types", value: "all" }, ...typeItems]

interface Filters {
  type: "all" | "income" | "expense"
  category: string
  startDate: string
  endDate: string
}

const emptyFilters: Filters = { type: "all", category: "", startDate: "", endDate: "" }

type SortField = NonNullable<EntriesQuery["sortBy"]>

export function Transactions() {
  const money = useMoney()
  const [data, setData] = useState<EntriesPage | null>(null)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC")
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters)
  const [filters, setFilters] = useState<Filters>(emptyFilters)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<Entry | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const hasRange = filters.startDate && filters.endDate
      const result = await api.getEntries({
        page,
        limit: PAGE_SIZE,
        sortBy,
        sortOrder,
        type: filters.type === "all" ? undefined : filters.type,
        category: filters.category.trim() || undefined,
        // Backend only applies the date filter when both ends are given
        startDate: hasRange ? filters.startDate : undefined,
        endDate: hasRange ? filters.endDate : undefined,
      })
      setData(result)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load entries")
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, sortOrder, filters])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
    } else {
      setSortBy(field)
      setSortOrder("DESC")
    }
    setPage(1)
  }

  const applyFilters = () => {
    if (Boolean(draftFilters.startDate) !== Boolean(draftFilters.endDate)) {
      toast.error("Pick both a start and end date to filter by date")
      return
    }
    setFilters(draftFilters)
    setPage(1)
  }

  const resetFilters = () => {
    setDraftFilters(emptyFilters)
    setFilters(emptyFilters)
    setPage(1)
  }

  const handleSave = async (values: EntryInput) => {
    if (editing) {
      await api.updateEntry(editing.id, values)
      toast.success("Entry updated")
      return editing.id
    }
    const { entry } = await api.createEntry(values)
    toast.success("Entry added")
    return entry.id
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await api.deleteEntry(deleting.id)
      toast.success("Entry deleted")
      setDeleting(null)
      // Step back a page if we just removed the last row on it
      if (data && data.entries.length === 1 && page > 1) setPage(page - 1)
      else await loadEntries()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete entry")
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await api.exportCsv()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed")
    } finally {
      setExporting(false)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortBy !== field ? (
      <ArrowUpDownIcon className="size-3.5 opacity-40" />
    ) : sortOrder === "ASC" ? (
      <ArrowUpIcon className="size-3.5" />
    ) : (
      <ArrowDownIcon className="size-3.5" />
    )

  const SortableHead = ({ field, label, className }: { field: SortField; label: string; className?: string }) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className={cn("inline-flex items-center gap-1 hover:text-foreground", className?.includes("text-right") && "flex-row-reverse")}
      >
        {label}
        <SortIcon field={field} />
      </button>
    </TableHead>
  )

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search, filter and manage every entry.</p>
      </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle>All entries</CardTitle>
              <CardDescription>
                {data ? `${data.totalCount} ${data.totalCount === 1 ? "entry" : "entries"}` : "Loading…"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={exporting}>
                <DownloadIcon />
                {exporting ? "Exporting…" : "Export CSV"}
              </Button>
              <Button
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <PlusIcon />
                Add entry
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
              <div className="grid gap-1.5">
                <Label className="text-xs">Type</Label>
                <Select
                  items={filterTypeItems}
                  value={draftFilters.type}
                  onValueChange={(value) => value && setDraftFilters({ ...draftFilters, type: value as Filters["type"] })}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterTypeItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-category" className="text-xs">Category</Label>
                <Input
                  id="f-category"
                  className="bg-card"
                  placeholder="Any"
                  value={draftFilters.category}
                  onChange={(e) => setDraftFilters({ ...draftFilters, category: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-start" className="text-xs">From</Label>
                <Input
                  id="f-start"
                  type="date"
                  className="bg-card"
                  value={draftFilters.startDate}
                  onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="f-end" className="text-xs">To</Label>
                <Input
                  id="f-end"
                  type="date"
                  className="bg-card"
                  value={draftFilters.endDate}
                  onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={applyFilters}>Apply</Button>
                <Button variant="ghost" onClick={resetFilters}>Reset</Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHead field="date" label="Date" />
                    <TableHead>Description</TableHead>
                    <SortableHead field="category" label="Category" />
                    <TableHead>Type</TableHead>
                    <SortableHead field="amount" label="Amount" className="text-right" />
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && !data ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Loading entries…
                      </TableCell>
                    </TableRow>
                  ) : !data || data.entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No entries found. Add your first transaction to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.entries.map((entry) => (
                      <TableRow key={entry.id} className={cn(loading && "opacity-60")}>
                        <TableCell className="whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                        <TableCell className="max-w-64 truncate">
                          {entry.description}
                          {entry.hasReceipt && (
                            <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="View receipt"
                            title="View receipt"
                            className="ml-1 align-middle text-muted-foreground"
                            onClick={() => setViewingReceipt(entry)}
                          >
                            <PaperclipIcon />
                          </Button>
                          )}
                        </TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              entry.type === "income"
                                ? "border-success/30 bg-success/10 text-success"
                                : "border-destructive/30 bg-destructive/10 text-destructive",
                            )}
                          >
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium tabular-nums",
                            entry.type === "income" ? "text-success" : "text-destructive",
                          )}
                        >
                          {entry.type === "income" ? "+" : "−"}
                          {money.format(Number(entry.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Edit entry"
                            onClick={() => {
                              setEditing(entry)
                              setFormOpen(true)
                            }}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete entry"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(entry)}
                          >
                            <Trash2Icon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {data.currentPage} of {data.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      <EntryFormDialog open={formOpen} onOpenChange={setFormOpen} entry={editing} onSubmit={handleSave} onSaved={loadEntries} />
      <ReceiptViewer entry={viewingReceipt} onClose={() => setViewingReceipt(null)} />

      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>
              {deleting && `"${deleting.description}" (${money.format(Number(deleting.amount))}) will be permanently removed.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
