import { create } from 'zustand'
import { db, type Practice, type PracticeSession } from '../lib/db'
import {
  NGONDRO_PLAN_DAYS,
  NGONDRO_TOTAL,
  isNgondroCategory,
  type PracticeCategory,
} from '../lib/types'

interface PracticeState {
  practices: Practice[]
  loading: boolean
  loadPractices: () => Promise<void>
  addPractice: (data: {
    name: string
    category: PracticeCategory
    targetCount?: number
    planDays?: number
    description?: string
  }) => Promise<void>
  deletePractice: (id: number) => Promise<void>
  incrementCount: (id: number, amount?: number) => Promise<void>
  getSessions: (practiceId: number) => Promise<PracticeSession[]>
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  practices: [],
  loading: false,

  loadPractices: async () => {
    set({ loading: true })
    const practices = await db.practices.orderBy('createdAt').reverse().toArray()
    set({ practices, loading: false })
  },

  addPractice: async (data) => {
    const isNgondro = isNgondroCategory(data.category)
    const practice: Practice = {
      name: data.name,
      category: data.category,
      description: data.description,
      targetCount: isNgondro ? NGONDRO_TOTAL : (data.targetCount ?? 1000),
      completedCount: 0,
      planDays: isNgondro ? NGONDRO_PLAN_DAYS : (data.planDays ?? 0),
      createdAt: new Date(),
    }
    await db.practices.add(practice)
    await get().loadPractices()
  },

  deletePractice: async (id) => {
    await db.practiceSessions.where('practiceId').equals(id).delete()
    await db.practices.delete(id)
    await get().loadPractices()
  },

  incrementCount: async (id, amount = 1) => {
    const practice = await db.practices.get(id)
    if (!practice) return
    const newCount = practice.completedCount + amount
    await db.practices.update(id, { completedCount: newCount })
    await db.practiceSessions.add({
      practiceId: id,
      count: amount,
      date: new Date(),
    })
    await get().loadPractices()
  },

  getSessions: async (practiceId) => {
    return db.practiceSessions.where('practiceId').equals(practiceId).reverse().sortBy('date')
  },
}))

export function getPracticeStats(practice: Practice) {
  const remaining = Math.max(0, practice.targetCount - practice.completedCount)
  const completionPercent =
    practice.targetCount > 0
      ? Math.min(100, (practice.completedCount / practice.targetCount) * 100)
      : 0
  const dailyNorm =
    practice.planDays > 0 ? Math.ceil(practice.targetCount / practice.planDays) : 0
  return { remaining, completionPercent, dailyNorm }
}
