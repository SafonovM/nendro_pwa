import { db } from './db'
import type { Dream, Practice, PracticeSession, Transmission } from './db'
import { base64ToBlob, blobToBase64 } from '../store/practiceTextStore'
import type { AppSettings } from '../store/settingsStore'
import {
  dreamCategoryFromAndroid,
  dreamCategoryToAndroid,
  practiceCategoryFromAndroid,
  practiceCategoryToAndroid,
  transmissionTypeFromAndroid,
  transmissionTypeToAndroid,
} from './categoryMapping'
import { fromEpochMs, startOfDay, toEpochMs } from './dates'
import type { DreamCategory, PracticeCategory, TransmissionType } from './types'

export const EXPORT_VERSION = 4
export const APP_NAME = 'YungdrungDiary'

export interface BackupPayload {
  exportVersion?: number
  version?: number
  exportedAt: number | string
  appName?: string
  practices: unknown[]
  practiceSessions: unknown[]
  transmissions: unknown[]
  dreams: unknown[]
  practiceTexts: unknown[]
  settings?: AppSettings
}

function safePracticeCategory(category: unknown): PracticeCategory {
  const raw = String(category ?? 'custom')
  if (raw.includes('_') && raw === raw.toLowerCase()) {
    return raw as PracticeCategory
  }
  try {
    return practiceCategoryFromAndroid(raw)
  } catch {
    return 'custom'
  }
}

function androidPracticeExport(p: Practice) {
  const category = safePracticeCategory(p.category)
  return {
    id: p.id,
    name: p.name,
    category: practiceCategoryToAndroid(category),
    description: p.description ?? null,
    targetCount: p.targetCount,
    completedCount: p.completedCount,
    planDays: p.planDays,
    createdAt: toEpochMs(p.createdAt),
  }
}

function androidSessionExport(s: PracticeSession) {
  return {
    id: s.id,
    practiceId: s.practiceId,
    count: s.count,
    date: toEpochMs(s.date),
    note: s.note ?? null,
  }
}

function androidTransmissionExport(t: Transmission) {
  return {
    id: t.id,
    title: t.name,
    type: transmissionTypeToAndroid(t.type),
    teacherName: t.teacher,
    receivedDate: toEpochMs(t.date),
    location: t.place || null,
    notes: t.notes || null,
    teacherPhotoBase64: null,
    createdAt: toEpochMs(t.date),
  }
}

function androidDreamExport(d: Dream) {
  return {
    id: d.id,
    date: toEpochMs(d.date),
    title: d.title,
    description: d.description,
    interpretation: null,
    emotions: d.emotions || null,
    lucidSigns: null,
    category: dreamCategoryToAndroid(d.category),
    isSignificant: d.isSignificant,
    createdAt: toEpochMs(d.date),
  }
}

export async function exportBackup(settings?: AppSettings): Promise<string> {
  const [practices, practiceSessions, transmissions, dreams, practiceTexts, practiceTextFiles] =
    await Promise.all([
      db.practices.toArray(),
      db.practiceSessions.toArray(),
      db.transmissions.toArray(),
      db.dreams.toArray(),
      db.practiceTexts.toArray(),
      db.practiceTextFiles.toArray(),
    ])

  const filesByTextId = new Map(
    practiceTextFiles.map((record) => [record.practiceTextId, record.blob]),
  )

  const practiceTextsExport = await Promise.all(
    practiceTexts.map(async (text) => {
      const category = safePracticeCategory(text.category)
      const blob = filesByTextId.get(text.id ?? -1)
      const fileBase64 = blob ? await blobToBase64(blob) : undefined
      return {
        id: text.id,
        title: text.title,
        category: practiceCategoryToAndroid(category),
        description: text.description ?? null,
        fileName: text.fileName ?? null,
        mimeType: text.mimeType ?? null,
        filePath: null,
        fileBase64: fileBase64 ?? null,
        createdAt: toEpochMs(text.createdAt),
      }
    }),
  )

  const payload: BackupPayload = {
    exportVersion: EXPORT_VERSION,
    exportedAt: Date.now(),
    appName: APP_NAME,
    practices: practices.map(androidPracticeExport),
    practiceSessions: practiceSessions.map(androidSessionExport),
    transmissions: transmissions.map(androidTransmissionExport),
    dreams: dreams.map(androidDreamExport),
    practiceTexts: practiceTextsExport,
  }

  if (settings) {
    payload.settings = settings
  }

  return JSON.stringify(payload, null, 2)
}

function parsePractice(item: Record<string, unknown>): Practice {
  const categoryRaw = String(item.category ?? 'CUSTOM')
  let category: PracticeCategory
  try {
    category =
      categoryRaw.includes('_') && categoryRaw === categoryRaw.toLowerCase()
        ? (categoryRaw as PracticeCategory)
        : practiceCategoryFromAndroid(categoryRaw)
  } catch {
    category = 'custom'
  }

  return {
    id: Number(item.id),
    name: String(item.name ?? ''),
    category,
    description: item.description ? String(item.description) : undefined,
    targetCount: Number(item.targetCount ?? 0),
    completedCount: Number(item.completedCount ?? 0),
    planDays: Number(item.planDays ?? 0),
    createdAt: fromEpochMs(toEpochMs(item.createdAt as number | string)),
  }
}

function parseSession(item: Record<string, unknown>): PracticeSession {
  return {
    id: Number(item.id),
    practiceId: Number(item.practiceId),
    count: Number(item.count ?? 0),
    date: fromEpochMs(toEpochMs(item.date as number | string)),
    note: item.note ? String(item.note) : undefined,
  }
}

function parseTransmission(item: Record<string, unknown>): Transmission {
  const typeRaw = String(item.type ?? 'LUNG')
  let type: TransmissionType
  try {
    type =
      typeRaw === typeRaw.toLowerCase()
        ? (typeRaw as TransmissionType)
        : transmissionTypeFromAndroid(typeRaw)
  } catch {
    type = 'lung'
  }

  const receivedDate = item.receivedDate ?? item.date
  const dateMs = toEpochMs(receivedDate as number | string)

  return {
    id: Number(item.id),
    name: String(item.title ?? item.name ?? ''),
    type,
    teacher: String(item.teacherName ?? item.teacher ?? ''),
    date: fromEpochMs(dateMs),
    place: String(item.location ?? item.place ?? ''),
    notes: String(item.notes ?? ''),
  }
}

function parseDream(item: Record<string, unknown>): Dream {
  const categoryRaw = String(item.category ?? 'ORDINARY')
  let category: DreamCategory
  try {
    category =
      categoryRaw === categoryRaw.toLowerCase()
        ? (categoryRaw as DreamCategory)
        : dreamCategoryFromAndroid(categoryRaw)
  } catch {
    category = 'ordinary'
  }

  const dateMs = toEpochMs(item.date as number | string)

  return {
    id: Number(item.id),
    title: String(item.title ?? ''),
    description: String(item.description ?? ''),
    date: fromEpochMs(dateMs),
    category,
    emotions: String(item.emotions ?? ''),
    isSignificant: Boolean(item.isSignificant),
  }
}

function validateSessions(practices: Practice[], sessions: PracticeSession[]) {
  const ids = new Set(practices.map((p) => p.id))
  for (const s of sessions) {
    if (!ids.has(s.practiceId)) {
      throw new Error(`Session ${s.id} references missing practice ${s.practiceId}`)
    }
  }
}

export async function importBackup(json: string): Promise<AppSettings | undefined> {
  const data = JSON.parse(json) as BackupPayload

  const exportVersion = data.exportVersion ?? data.version
  if (exportVersion != null && exportVersion > EXPORT_VERSION) {
    throw new Error(`Unsupported backup version: ${exportVersion}`)
  }

  if (data.appName && data.appName !== APP_NAME) {
    throw new Error(`Unknown backup source: ${data.appName}`)
  }

  const practices = (data.practices ?? []).map((p) => parsePractice(p as Record<string, unknown>))
  const practiceSessions = (data.practiceSessions ?? []).map((s) =>
    parseSession(s as Record<string, unknown>),
  )
  const transmissions = (data.transmissions ?? []).map((t) =>
    parseTransmission(t as Record<string, unknown>),
  )
  const dreams = (data.dreams ?? []).map((d) => parseDream(d as Record<string, unknown>))

  validateSessions(practices, practiceSessions)

  await db.transaction(
    'rw',
    [
      db.practices,
      db.practiceSessions,
      db.transmissions,
      db.dreams,
      db.practiceTexts,
      db.practiceTextFiles,
    ],
    async () => {
      await db.practices.clear()
      await db.practiceSessions.clear()
      await db.transmissions.clear()
      await db.dreams.clear()
      await db.practiceTexts.clear()
      await db.practiceTextFiles.clear()

      if (practices.length) await db.practices.bulkPut(practices)
      if (practiceSessions.length) await db.practiceSessions.bulkPut(practiceSessions)
      if (transmissions.length) await db.transmissions.bulkPut(transmissions)
      if (dreams.length) await db.dreams.bulkPut(dreams)

      if (data.practiceTexts) {
        for (const item of data.practiceTexts) {
          const raw = item as Record<string, unknown>
          const categoryRaw = String(raw.category ?? 'CUSTOM')
          let category: PracticeCategory
          try {
            category =
              categoryRaw.includes('_') && categoryRaw === categoryRaw.toLowerCase()
                ? (categoryRaw as PracticeCategory)
                : practiceCategoryFromAndroid(categoryRaw)
          } catch {
            category = 'custom'
          }

          const textId = await db.practiceTexts.put({
            id: raw.id != null ? Number(raw.id) : undefined,
            title: String(raw.title ?? ''),
            category,
            description: raw.description ? String(raw.description) : undefined,
            fileName: raw.fileName ? String(raw.fileName) : undefined,
            mimeType: raw.mimeType ? String(raw.mimeType) : undefined,
            createdAt: fromEpochMs(toEpochMs(raw.createdAt as number | string)),
          })

          const fileBase64 = raw.fileBase64 ? String(raw.fileBase64) : undefined
          if (fileBase64 && raw.fileName) {
            const blob = base64ToBlob(
              fileBase64,
              String(raw.mimeType ?? 'application/octet-stream'),
            )
            await db.practiceTextFiles.add({ practiceTextId: textId as number, blob })
          }
        }
      }
    },
  )

  return data.settings
}

export function getTodayCount(sessions: PracticeSession[], practiceId: number): number {
  const today = startOfDay().getTime()
  return sessions
    .filter((s) => s.practiceId === practiceId && startOfDay(s.date).getTime() === today)
    .reduce((sum, s) => sum + s.count, 0)
}

export interface DailyHistoryEntry {
  date: Date
  count: number
}

export interface MonthlyHistoryGroup {
  monthKey: string
  monthLabel: string
  days: DailyHistoryEntry[]
  total: number
}

export function groupSessionsByMonth(sessions: PracticeSession[]): MonthlyHistoryGroup[] {
  const byDay = new Map<number, number>()
  for (const s of sessions) {
    const dayKey = startOfDay(s.date).getTime()
    byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + s.count)
  }

  const byMonth = new Map<string, DailyHistoryEntry[]>()
  for (const [dayKey, count] of byDay) {
    const date = new Date(dayKey)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const list = byMonth.get(monthKey) ?? []
    list.push({ date, count })
    byMonth.set(monthKey, list)
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, days]) => {
      const [year, month] = monthKey.split('-').map(Number)
      const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric',
      })
      const sortedDays = days.sort((a, b) => b.date.getTime() - a.date.getTime())
      return {
        monthKey,
        monthLabel,
        days: sortedDays,
        total: sortedDays.reduce((sum, d) => sum + d.count, 0),
      }
    })
}
