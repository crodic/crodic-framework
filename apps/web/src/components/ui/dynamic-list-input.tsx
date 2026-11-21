import { useState, type KeyboardEvent } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface DynamicListInputProps {
  value?: string[] | string
  onChange?: (value: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxItems?: number
}

export function DynamicListInput({
  value = [],
  onChange,
  placeholder = 'Thêm mục mới...',
  className,
  disabled = false,
  maxItems = 50,
}: DynamicListInputProps) {
  const [draftValue, setDraftValue] = useState('')

  const items: string[] = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  const handleAddItem = () => {
    const trimmed = draftValue.trim()
    if (!trimmed || items.length >= maxItems) return
    const next = [...items, trimmed]
    onChange?.(next)
    setDraftValue('')
  }

  const handleUpdateItem = (index: number, newText: string) => {
    const next = [...items]
    next[index] = newText
    onChange?.(next)
  }

  const handleRemoveItem = (index: number) => {
    const next = items.filter((_, idx) => idx !== index)
    onChange?.(next)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddItem()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <div key={index} className='flex items-center gap-2'>
          <Input
            value={item}
            onChange={(e) => handleUpdateItem(index, e.target.value)}
            disabled={disabled}
            className='bg-background h-9 flex-1 text-sm shadow-xs'
          />
          <button
            type='button'
            disabled={disabled}
            onClick={() => handleRemoveItem(index)}
            className='flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-rose-200 bg-rose-100 text-rose-600 transition-colors hover:bg-rose-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60'
            aria-label='Xóa mục'
            title='Xóa mục này'
          >
            <Minus className='size-4 stroke-[2.5]' />
          </button>
        </div>
      ))}

      {/* Row to add new item */}
      {items.length < maxItems && (
        <div className='flex items-center gap-2'>
          <Input
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className='bg-background h-9 flex-1 text-sm shadow-xs'
          />
          <button
            type='button'
            disabled={disabled || !draftValue.trim()}
            onClick={handleAddItem}
            className='flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-amber-500/40 bg-amber-400 font-bold text-amber-950 transition-colors hover:bg-amber-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50'
            aria-label='Thêm mục'
            title='Thêm mục mới'
          >
            <Plus className='size-4 stroke-[2.5]' />
          </button>
        </div>
      )}
    </div>
  )
}
