import { create } from 'zustand'
import { db, type Practice, type PracticeSession } from '../lib/db'
import { startOfDay } from '../lib/dates'
import {
  NGONDRO_PLAN_DAYS,
  NGONDRO_TOTAL,
  isNgondroCategory,
  type PracticeCategory,
} from '../lib/types'

interface AddSessionResult {
  goalReached: boolean
}

interface MalaTapResult {
  sessionId: number
  goalReached: boolean
}

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
  updatePractice: (
    id: number,
    data: {
      name: string
      category: PracticeCategory
      targetCount?: number
      planDays?: number
      description?: string
    },
  ) => Promise<void>
  incrementCount: (id: number, amount?: number) => Promise<AddSessionResult>
  addSession: (
    practiceId: number,
    count: number,
    date?: Date,
    note?: string,
  ) => Promise<AddSessionResult>
  quickAddSession: (practiceId: number, count: number) => Promise<AddSessionResult>
  addMalaRepetition: (practiceId: number, activeSessionId: number | null) => Promise<MalaTapResult>
  getSessions: (practiceId: number) => Promise<PracticeSession[]>
}

async function finalizeAdd(practiceId: number, addedCount: number): Promise<AddSessionResult> {
  const practice = await db.practices.get(practiceId)
  if (!practice) return { goalReached: false }
  const newCount = practice.completedCount + addedCount
  await db.practices.update(practiceId, { completedCount: newCount })
  await usePracticeStore.getState().loadPractices()
  return { goalReached: newCount >= practice.targetCount }
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
      planDays: data.planDays ?? (isNgondro ? NGONDRO_PLAN_DAYS : 0),
      createdAt: new Date(),
    }
    if (!isNgondro && data.targetCount !== undefined) {
      practice.targetCount = data.targetCount
    }
    await db.practices.add(practice)
    await get().loadPractices()
  },

  deletePractice: async (id) => {
    await db.practiceSessions.where('practiceId').equals(id).delete()
    await db.practices.delete(id)
    await get().loadPractices()
  },

  updatePractice: async (id, data) => {
    const existing = await db.practices.get(id)
    if (!existing) return
    const isNgondro = isNgondroCategory(data.category)
    await db.practices.update(id, {
      name: data.name,
      category: data.category,
      description: data.description,
      targetCount: isNgondro ? NGONDRO_TOTAL : (data.targetCount ?? existing.targetCount),
      planDays: data.planDays ?? existing.planDays,
    })
    await get().loadPractices()
  },

  incrementCount: async (id, amount = 1) => {
    await db.practiceSessions.add({
      practiceId: id,
      count: amount,
      date: startOfDay(),
    })
    return finalizeAdd(id, amount)
  },

  addSession: async (practiceId, count, date = startOfDay(), note) => {
    await db.practiceSessions.add({
      practiceId,
      count,
      date: startOfDay(date),
      note: note?.trim() || undefined,
    })
    return finalizeAdd(practiceId, count)
  },

  quickAddSession: async (practiceId, count) => {
    return get().addSession(practiceId, count, startOfDay())
  },

  addMalaRepetition: async (practiceId, activeSessionId) => {
    const today = startOfDay()
    let sessionId = activeSessionId

    if (sessionId != null) {
      const existing = await db.practiceSessions.get(sessionId)
      if (!existing || existing.practiceId !== practiceId) {
        sessionId = null
      }
    }

    if (sessionId == null) {
      sessionId = (await db.practiceSessions.add({
        practiceId,
        count: 1,
        date: today,
      })) as number
    } else {
      const existing = (await db.practiceSessions.get(sessionId))!
      await db.practiceSessions.update(sessionId, { count: existing.count + 1 })
    }

    const result = await finalizeAdd(practiceId, 1)
    return { sessionId, goalReached: result.goalReached }
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

export function calcDailyNorm(targetCount: number, planDays: number): number {
  if (planDays <= 0) return 0
  return Math.ceil(targetCount / planDays)
}