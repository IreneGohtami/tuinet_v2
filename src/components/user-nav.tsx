
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { UserCircle, LogOut, User } from 'lucide-react'

export function UserNav({ email }: { email: string | undefined }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="User menu"
      >
        <UserCircle className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95 duration-100 z-50">
          <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
            My Account
            <p className="text-xs font-normal text-muted-foreground truncate">{email}</p>
          </div>
          <div className="h-px bg-border my-1" />
          <Link
            href="/account"
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
          <div className="h-px bg-border my-1" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
