
'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string // ISO date string or empty
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function DatePicker({ value, onChange, placeholder = 'Select date...', label }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse initial value or default to today
  const initialDate = value ? new Date(value) : new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
  }

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    // Adjust for local timezone to get proper ISO date part
    const offset = selectedDate.getTimezoneOffset()
    const adjustedDate = new Date(selectedDate.getTime() - (offset * 60 * 1000))
    onChange(adjustedDate.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const days = []
    const totalDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)

    // Empty cells for days of previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = value && new Date(value).getDate() === day &&
        new Date(value).getMonth() === month &&
        new Date(value).getFullYear() === year
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={cn(
            "h-8 w-8 text-xs font-medium rounded-md transition-colors flex items-center justify-center",
            isSelected ? "bg-primary text-primary-foreground" :
              isToday ? "bg-primary/10 text-primary border border-primary/20" :
                "hover:bg-secondary text-foreground"
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">{label}</label>}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
          isOpen ? "ring-2 ring-ring ring-offset-2" : "hover:border-primary/50"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? formatDateDisplay(value) : placeholder}
          </span>
        </div>
        {value && (
          <X
            className="h-3 w-3 text-muted-foreground hover:text-foreground shrink-0"
            onClick={clearDate}
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1 hover:bg-secondary rounded-md transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-bold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" onClick={nextMonth} className="p-1 hover:bg-secondary rounded-md transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-8 w-8 text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  )
}
