
'use client'

import { useState } from 'react'
import { Trash2, X, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTemplate } from '../email-actions'
import { useTransition } from 'react'

export function DeleteTemplateDialog({ template }: { template: { id: string; type: string } }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteTemplate(template.id)
      if (result.success) {
        setIsOpen(false)
        toast.success('Email template deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete template')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action-danger"
        title="Delete Template"
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
                <h3 className="text-xl font-bold text-foreground">Delete Template</h3>
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
                Are you sure you want to delete the template <span className="font-bold text-foreground">{template.type}</span>?
              </p>
              <p className="text-sm text-destructive font-medium p-3 bg-destructive/5 rounded-lg">
                Warning: This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="btn-secondary h-11 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-6 h-11 min-w-[120px] rounded-lg transition-all flex items-center justify-center"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
