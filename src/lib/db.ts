import Dexie, { type Table } from 'dexie'
import type { DreamCategory, PracticeCategory, TransmissionType } from './types'

export interface Practice {
  id?: number
  name: string
  category: PracticeCategory
  description?: string
  targetCount: number
  completedCount: number
  planDays: number
  createdAt: Date
}

export interface PracticeSession {
  id?: number
  practiceId: number
  count: number
  date: Date
  note?: string
}

export interface Transmission {
  id?: number
  name: string
  type: TransmissionType
  teacher: string
  date: Date
  place: string
  notes: string
}

export interface Dream {
  id?: number
  title: string
  description: string
  date: Date
  category: DreamCategory
  emotions: string
  isSignificant: boolean
}

export interface PracticeText {
  id?: number
  title: string
  category: string
  description?: string
  fileName?: string
  mimeType?: string
  createdAt: Date
}

export interface PracticeTextFile {
  id?: number
  practiceTextId: number
  blob: Blob
}

export type PracticeMediaType = 'image' | 'video'

export interface PracticeMedia {
  id?: number
  practiceId: number
  mediaType: PracticeMediaType
  blob: Blob
  fileName: string
  mimeType?: string
  sortOrder: number
}

export class YungdrungDB extends Dexie {
  practices!: Table<Practice>
  practiceSessions!: Table<PracticeSession>
  transmissions!: Table<Transmission>
  dreams!: Table<Dream>
  practiceTexts!: Table<PracticeText>
  practiceTextFiles!: Table<PracticeTextFile>
  practiceMedia!: Table<PracticeMedia>

  constructor() {
    super('yungdrungDiary')
    this.version(1).stores({
      practices: '++id, category, createdAt',
      practiceSessions: '++id, practiceId, date',
      transmissions: '++id, date, type',
      dreams: '++id, date, category',
    })
    this.version(2).stores({
      practices: '++id, category, createdAt',
      practiceSessions: '++id, practiceId, date',
      transmissions: '++id, date, type',
      dreams: '++id, date, category',
      practiceTexts: '++id, title, category, createdAt, fileName',
      practiceTextFiles: '++id, practiceTextId',
    })
    this.version(3).stores({
      practices: '++id, category, createdAt',
      practiceSessions: '++id, practiceId, date',
      transmissions: '++id, date, type',
      dreams: '++id, date, category',
      practiceTexts: '++id, title, category, createdAt, fileName',
      practiceTextFiles: '++id, practiceTextId',
      practiceMedia: '++id, practiceId, mediaType, sortOrder',
    })
  }
}

export const db = new YungdrungDB()
