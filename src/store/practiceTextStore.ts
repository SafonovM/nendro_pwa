import { create } from 'zustand'
import { db, type PracticeText } from '../lib/db'

interface PracticeTextState {
  texts: PracticeText[]
  loading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  loadTexts: () => Promise<void>
  getText: (id: number) => Promise<PracticeText | undefined>
  getFileBlob: (practiceTextId: number) => Promise<Blob | undefined>
  addText: (data: {
    title: string
    description?: string
    file?: File | null
  }) => Promise<number>
  updateText: (
    id: number,
    data: { title: string; description?: string; file?: File | null; removeFile?: boolean },
  ) => Promise<void>
  deleteText: (id: number) => Promise<void>
  filteredTexts: () => PracticeText[]
}

export const usePracticeTextStore = create<PracticeTextState>((set, get) => ({
  texts: [],
  loading: false,
  searchQuery: '',

  setSearchQuery: (q) => set({ searchQuery: q }),

  loadTexts: async () => {
    set({ loading: true })
    const texts = await db.practiceTexts.orderBy('createdAt').reverse().toArray()
    set({ texts, loading: false })
  },

  getText: async (id) => db.practiceTexts.get(id),

  getFileBlob: async (practiceTextId) => {
    const record = await db.practiceTextFiles.where('practiceTextId').equals(practiceTextId).first()
    return record?.blob
  },

  addText: async (data) => {
    const textId = await db.practiceTexts.add({
      title: data.title.trim(),
      category: 'custom',
      description: data.description?.trim() || undefined,
      createdAt: new Date(),
    })
    if (data.file) {
      await db.practiceTextFiles.add({
        practiceTextId: textId,
        blob: data.file,
      })
      await db.practiceTexts.update(textId, {
        fileName: data.file.name,
        mimeType: data.file.type || 'application/octet-stream',
      })
    }
    await get().loadTexts()
    return textId
  },

  updateText: async (id, data) => {
    await db.practiceTexts.update(id, {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
    })
    if (data.removeFile) {
      await db.practiceTextFiles.where('practiceTextId').equals(id).delete()
      await db.practiceTexts.update(id, { fileName: undefined, mimeType: undefined })
    } else if (data.file) {
      await db.practiceTextFiles.where('practiceTextId').equals(id).delete()
      await db.practiceTextFiles.add({ practiceTextId: id, blob: data.file })
      await db.practiceTexts.update(id, {
        fileName: data.file.name,
        mimeType: data.file.type || 'application/octet-stream',
      })
    }
    await get().loadTexts()
  },

  deleteText: async (id) => {
    await db.practiceTextFiles.where('practiceTextId').equals(id).delete()
    await db.practiceTexts.delete(id)
    await get().loadTexts()
  },

  filteredTexts: () => {
    const { texts, searchQuery } = get()
    if (!searchQuery.trim()) return texts
    const q = searchQuery.toLowerCase()
    return texts.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        (t.fileName?.toLowerCase().includes(q) ?? false),
    )
  },
}))

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mimeType })
}

export async function openPracticeTextFile(blob: Blob, fileName: string, mimeType?: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.target = '_blank'
  link.rel = 'noopener'
  if (mimeType?.startsWith('application/pdf') || mimeType?.startsWith('text/')) {
    window.open(url, '_blank')
  } else {
    link.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
