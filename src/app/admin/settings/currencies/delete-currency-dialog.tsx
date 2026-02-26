
'use client'

import { useState } from 'react'
import { deleteCurrency } from '../../reference-data-actions'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteCurrencyDialog({ currency }: { currency: { id: string; code: string } }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error', text: string } | null>(null)

  const handleDelete = async () => {
    setIsLoading(true)
    setMessage(null)
    const result = await deleteCurrency(currency.id)
    setIsLoading(false)

    if (result.success) {
      setIsOpen(false)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete currency' })
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Currency</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{currency.code}</strong>?
              <br />
              This action cannot be undone.
            </p>

            {message && (
              <div className="mb-4 p-3 rounded-md text-sm bg-red-500/10 text-red-500">
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="btn-secondary h-9"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="btn-primary h-9 bg-destructive hover:bg-destructive/90 transition-colors"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
