import type { ReactNode } from 'react'
import { create } from 'zustand'

export interface BreadcrumbItem {
  title: ReactNode
  href?: string
}

interface BreadcrumbStore {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
  clearItems: () => void
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clearItems: () => set({ items: [] }),
}))
