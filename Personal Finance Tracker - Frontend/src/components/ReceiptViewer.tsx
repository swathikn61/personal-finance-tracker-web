import { useEffect, useState } from "react"
import { ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api, type Entry } from "@/lib/api"

export function ReceiptViewer({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entry) return
    let objectUrl: string | null = null
    let cancelled = false
    setUrl(null)
    setError(null)
    api
      .getReceiptUrl(entry.id)
      .then((u) => {
        objectUrl = u
        if (cancelled) URL.revokeObjectURL(u)
        else setUrl(u)
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load receipt"))
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [entry])

  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>{entry?.description}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {error ? (
            <p className="p-6 text-sm text-destructive">{error}</p>
          ) : url ? (
            <img src={url} alt={`Receipt for ${entry?.description ?? "entry"}`} className="max-h-[65vh] w-auto object-contain" />
          ) : (
            <p className="p-6 text-sm text-muted-foreground">Loading receipt…</p>
          )}
        </div>
        {url && (
          <Button variant="outline" className="justify-self-start" nativeButton={false} render={<a href={url} target="_blank" rel="noreferrer" />}>
            <ExternalLinkIcon />
            Open full size
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
