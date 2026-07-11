import { create } from 'zustand'
import { db, type Dream } from '../lib/db'
import type { DreamCategory } from '../lib/types'

interface DreamState {
  dreams: Dream[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  loadDreams: () => Promise<void>
  addDream: (data: Omit<Dream, 'id'>) => Promise<number>
  deleteDream: (id: number) => Promise<void>
  filteredDreams: () => Dream[]
}

export const useDreamStore = create<DreamState>((set, get) => ({
  dreams: [],
  loading: false,
  searchQuery: '',

  setSearchQuery: (q) => set({ searchQuery: q }),

  loadDreams: async () => {
    set({ loading: true })
    const dreams = await db.dreams.orderBy('date').reverse().toArray()
    set({ dreams, loading: false })
  },

  addDream: async (data) => {
    const id = (await db.dreams.add(data)) as number
    await get().loadDreams()
    return id
  },

  deleteDream: async (id) => {
    await db.dreams.delete(id)
    await get().loadDreams()
  },

  filteredDreams: () => {
    const { dreams, searchQuery } = get()
    if (!searchQuery.trim()) return dreams
    const q = searchQuery.toLowerCase()
    return dreams.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.emotions.toLowerCase().includes(q),
    )
  },
}))

export type { DreamCategory }
