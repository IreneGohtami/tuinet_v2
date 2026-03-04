'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ReferenceOption {
  id: string | number
  code: string
  name?: string
}

interface MultiSelectDropdownProps {
  label: string
  options: ReferenceOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  valueKey?: 'id' | 'code'
}

export function MultiSelectDropdown({ label, options, selectedValues, onChange, valueKey = 'code' }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (value: string) => {
    if (value === 'all') {
      onChange([])
      return
    }
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onChange(newValues)
  }

  const selectedOptions = options.filter(opt => {
    const val = String(valueKey === 'id' ? opt.id : opt.code)
    return selectedValues.includes(val)
  })

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm bg-background border border-border rounded-md hover:border-primary/50 transition-all h-10 overflow-hidden text-left",
          isOpen && "ring-1 ring-primary border-primary"
        )}
      >
        <span className="truncate text-foreground font-medium">
          {selectedValues.length === 0
            ? `All ${label}`
            : selectedValues.length <= 3
              ? selectedValues.map(v => {
                const opt = options.find(o => String(valueKey === 'id' ? o.id : o.code) === v)
                return opt ? opt.code : v
              }).join(', ')
              : `${selectedValues.slice(0, 3).map(v => {
                const opt = options.find(o => String(valueKey === 'id' ? o.id : o.code) === v)
                return opt ? opt.code : v
              }).join(', ')} ... (+${selectedValues.length - 3})`
          }
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={() => toggleOption('all')}
              className={cn(
                "w-full flex items-center px-3 py-2 text-sm rounded-sm hover:bg-secondary/50 transition-colors",
                selectedValues.length === 0 && "text-primary font-semibold bg-primary/5"
              )}
            >
              <div className="flex-1 text-left">All {label}</div>
              {selectedValues.length === 0 && <Check className="h-4 w-4" />}
            </button>
            <div className="h-px bg-border my-1" />
            {options.map(option => (
              <button
                type="button"
                key={option.id}
                onClick={() => toggleOption(String(valueKey === 'id' ? option.id : option.code))}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm rounded-sm hover:bg-secondary/50 transition-colors",
                  selectedValues.includes(String(valueKey === 'id' ? option.id : option.code)) && "text-primary font-semibold bg-primary/5"
                )}
              >
                <div className="flex-1 text-left truncate">
                  <span className="font-bold">{option.code}</span>
                  {option.name ? <span className="ml-2 text-muted-foreground font-normal">{option.name}</span> : ''}
                </div>
                {selectedValues.includes(String(valueKey === 'id' ? option.id : option.code)) && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedOptions.slice(0, 3).map(opt => (
            <span key={opt.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md border border-primary/20">
              {opt.code}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleOption(String(valueKey === 'id' ? opt.id : opt.code))
                }}
                className="hover:text-foreground transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {selectedValues.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-medium self-center">+{selectedValues.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  )
}
