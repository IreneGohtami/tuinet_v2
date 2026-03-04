
'use client'

import { useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { duplicateTemplate } from '../email-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function DuplicateButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateTemplate(id)
      if (result.success) {
        toast.success('Template duplicated successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to duplicate template')
      }
    })
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={isPending}
      className="btn-action"
      title="Duplicate Template"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  )
}
