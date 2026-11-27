import { useState, type KeyboardEvent } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
          <Button
            type='button'
            variant='destructive'
            size='icon'
            disabled={disabled}
            onClick={() => handleRemoveItem(index)}
            className='size-9 shrink-0'
            aria-label='Xóa mục'
            title='Xóa mục này'
          >
            <Minus className='size-4 stroke-[2.5]' />
          </Button>
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
          <Button
            type='button'
            variant='default'
            size='icon'
            disabled={disabled || !draftValue.trim()}
            onClick={handleAddItem}
            className='size-9 shrink-0'
            aria-label='Thêm mục'
            title='Thêm mục mới'
          >
            <Plus className='size-4 stroke-[2.5]' />
          </Button>
        </div>
      )}
    </div>
  )
}
