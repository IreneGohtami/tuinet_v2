
'use client'

import { useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { duplicateTemplate } from '../email-actions'
import { useRouter } from 'next/navigation'

export function DuplicateButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDuplicate() {
    setLoading(true)
    const result = await duplicateTemplate(id)
    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="btn-action"
      title="Duplicate Template"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  )
}
