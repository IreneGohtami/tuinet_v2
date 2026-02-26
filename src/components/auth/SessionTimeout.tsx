'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES || 5)
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000

export function SessionTimeout() {
  const router = useRouter()
  const supabase = createClient()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }, [supabase, router])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      // Check if user is still logged in before logging out
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.log('Session timed out due to inactivity')
        handleLogout()
      }
    }, TIMEOUT_MS)
  }, [handleLogout, supabase])

  useEffect(() => {
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    const handleActivity = () => {
      resetTimer()
    }

    // Set initial timer
    resetTimer()

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    // Listen for auth state changes to start/stop the timer
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        resetTimer()
      } else if (event === 'SIGNED_OUT') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    })

    return () => {
      // Cleanup
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      subscription.unsubscribe()
    }
  }, [resetTimer, supabase])

  return null
}
