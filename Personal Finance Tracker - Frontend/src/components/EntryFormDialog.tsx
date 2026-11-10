import { useEffect, useRef, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { ImagePlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { api, type Entry, type EntryInput, type EntryType } from "@/lib/api"
import { compressImage } from "@/lib/image"
import { useMoney } from "@/lib/money"

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = (): EntryInput => ({
  amount: 0,
  type: "expense",
  category: "",
  description: "",
  date: today(),
})

export const typeItems = [
  { label: "Expense", value: "expense" },
  { label: "Income", value: "income" },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: Entry | null
  // Saves the entry and resolves with its id; the dialog then uploads or removes the receipt
  onSubmit: (values: EntryInput) => Promise<number>
  // Called once the entry and its receipt are saved, so the page can reload
  onSaved: () => void | Promise<void>
}

export function EntryFormDialog({ open, onOpenChange, entry, onSubmit, onSaved }: Props) {
  const money = useMoney()
  const fileInput = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<EntryInput>(emptyForm)
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Receipt: a newly picked photo, or the entry's existing one (unless marked for removal)
  const [newReceipt, setNewReceipt] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [removeExisting, setRemoveExisting] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      entry
        ? { amount: entry.amount, type: entry.type, category: entry.category, description: entry.description, date: entry.date }
        : emptyForm(),
    )
    setAmount(entry ? String(entry.amount) : "")
    setError(null)
    setNewReceipt(null)
    setRemoveExisting(false)
    setPreview(null)

    if (!entry?.hasReceipt) return
    let objectUrl: string | null = null
    let cancelled = false
    api
      .getReceiptUrl(entry.id)
      .then((u) => {
        objectUrl = u
        if (cancelled) URL.revokeObjectURL(u)
        else setPreview(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, entry])

  // Revoke object URLs we create for newly picked photos
  useEffect(() => {
    if (!newReceipt || !preview) return
    return () => URL.revokeObjectURL(preview)
  }, [newReceipt, preview])

  const pickReceipt = async (file: File | undefined) => {
    if (!file) return
    setProcessing(true)
    setError(null)
    try {
      const blob = await compressImage(file)
      setNewReceipt(blob)
      setPreview(URL.createObjectURL(blob))
      setRemoveExisting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that image")
    } finally {
      setProcessing(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  const clearReceipt = () => {
    setNewReceipt(null)
    setPreview(null)
    if (entry?.hasReceipt) setRemoveExisting(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Amount must be a positive number")
      return
    }
    setSubmitting(true)
    setError(null)
    let entryId: number
    try {
      entryId = await onSubmit({ ...form, amount: parsed, category: form.category.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save entry")
      setSubmitting(false)
      return
    }

    // The entry is saved at this point; a receipt failure shouldn't lose it
    try {
      if (newReceipt) await api.uploadReceipt(entryId, newReceipt)
      else if (removeExisting) await api.deleteReceipt(entryId)
    } catch (err) {
      toast.error(`Entry saved, but the receipt couldn't be updated: ${err instanceof Error ? err.message : "unknown error"}`)
    }
    await onSaved()
    setSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{entry ? "Edit entry" : "Add entry"}</DialogTitle>
            <DialogDescription>Record an income or expense transaction.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                items={typeItems}
                value={form.type}
                onValueChange={(value) => value && setForm({ ...form, type: value as EntryType })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ({money.symbol})</Label>
              <Input
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Food, Salary"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="receipt">
              Receipt <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <input
              ref={fileInput}
              id="receipt"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pickReceipt(e.target.files?.[0])}
            />
            {preview ? (
              <div className="flex items-center gap-3 rounded-lg border p-2">
                <img src={preview} alt="Receipt preview" className="size-14 shrink-0 rounded-md border object-cover" />
                <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {newReceipt ? `New photo · ${Math.max(1, Math.round(newReceipt.size / 1024))} KB` : "Current receipt"}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInput.current?.click()}>
                  Replace
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={clearReceipt}>
                  Remove
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={processing}
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
              >
                <ImagePlusIcon className="size-4" />
                {processing ? "Preparing photo…" : removeExisting ? "Receipt will be removed. Attach a new photo" : "Attach a photo of the receipt"}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || processing}>
              {submitting ? "Saving…" : entry ? "Save changes" : "Add entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
