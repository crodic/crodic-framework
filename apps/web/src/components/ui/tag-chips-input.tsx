import { useState, KeyboardEvent, ClipboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TagChipsInputProps {
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  maxItems?: number
  className?: string
  disabled?: boolean
}

export function TagChipsInput({
  value = [],
  onChange,
  placeholder = 'Nhập và nhấn Enter...',
  maxItems = 30,
  className,
  disabled = false,
}: TagChipsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const items = Array.isArray(value) ? value : []

  const addTag = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    if (items.includes(trimmed)) {
      setInputValue('')
      return
    }
    if (items.length >= maxItems) return

    const next = [...items, trimmed]
    onChange?.(next)
    setInputValue('')
  }

  const removeTag = (indexToRemove: number) => {
    const next = items.filter((_, idx) => idx !== indexToRemove)
    onChange?.(next)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && items.length > 0) {
      removeTag(items.length - 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    if (text.includes(',')) {
      e.preventDefault()
      const splits = text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const uniqueNext = Array.from(new Set([...items, ...splits])).slice(
        0,
        maxItems
      )
      onChange?.(uniqueNext)
      setInputValue('')
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='border-input bg-background focus-within:ring-ring flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border p-2 focus-within:ring-2 focus-within:ring-offset-2'>
        {items.map((item, index) => (
          <Badge
            key={`${item}-${index}`}
            variant='secondary'
            className='flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-normal'
          >
            <span>{item}</span>
            {!disabled && (
              <button
                type='button'
                onClick={() => removeTag(index)}
                className='hover:bg-muted-foreground/20 rounded p-0.5 transition-colors'
              >
                <X className='text-muted-foreground hover:text-foreground size-3' />
              </button>
            )}
          </Badge>
        ))}

        {!disabled && isAdding ? (
          <div className='flex items-center gap-1'>
            <Input
              type='text'
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => {
                if (inputValue.trim()) {
                  addTag(inputValue)
                }
                setIsAdding(false)
              }}
              autoFocus
              placeholder={placeholder}
              className='h-7 w-36 px-2 py-1 text-xs'
            />
          </div>
        ) : null}

        {!disabled && !isAdding && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setIsAdding(true)}
            className='text-muted-foreground hover:text-foreground h-7 gap-1 px-2.5 text-xs'
          >
            <Plus className='size-3.5' />
            <span>Add</span>
          </Button>
        )}
      </div>
    </div>
  )
}
