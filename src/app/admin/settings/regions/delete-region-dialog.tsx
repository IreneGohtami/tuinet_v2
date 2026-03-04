
'use client'

import { useState } from 'react'
import { deleteRegion } from '../../reference-data-actions'
import { Trash2, X, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteRegionDialog({ region }: { region: { id: string; code: string } }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await deleteRegion(region.id)
    setIsLoading(false)

    if (result.success) {
      setIsOpen(false)
      toast.success('Region deleted successfully')
    } else {
      toast.error(result.error || 'Failed to delete region')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action-danger"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-left">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Delete Region</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete <span className="font-bold text-foreground">{region.code}</span>?
              </p>
              <p className="text-sm text-destructive font-medium p-3 bg-destructive/5 rounded-lg">
                Warning: This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="btn-secondary h-11 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 h-11 min-w-[120px] rounded-lg transition-all flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
