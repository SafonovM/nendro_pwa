import { db, type PracticeMedia, type PracticeMediaType } from '../lib/db'

export interface PracticeCustomMedia {
  image: PracticeMedia | null
  videos: PracticeMedia[]
}

export async function getPracticeMedia(practiceId: number): Promise<PracticeCustomMedia> {
  const items = await db.practiceMedia.where('practiceId').equals(practiceId).toArray()
  const image = items.find((item) => item.mediaType === 'image') ?? null
  const videos = items
    .filter((item) => item.mediaType === 'video')
    .sort((a, b) => a.sortOrder - b.sortOrder || (a.id ?? 0) - (b.id ?? 0))
  return { image, videos }
}

export async function deleteAllPracticeMedia(practiceId: number): Promise<void> {
  await db.practiceMedia.where('practiceId').equals(practiceId).delete()
}

export async function replacePracticeImage(
  practiceId: number,
  file: File,
): Promise<PracticeMedia> {
  const existing = await db.practiceMedia
    .where('practiceId')
    .equals(practiceId)
    .filter((item) => item.mediaType === 'image')
    .toArray()
  await db.practiceMedia.bulkDelete(existing.map((item) => item.id!).filter(Boolean))

  const id = (await db.practiceMedia.add({
    practiceId,
    mediaType: 'image',
    blob: file,
    fileName: file.name,
    mimeType: file.type || undefined,
    sortOrder: 0,
  })) as number

  const saved = await db.practiceMedia.get(id)
  if (!saved) throw new Error('Failed to save practice image')
  return saved
}

export async function addPracticeVideo(practiceId: number, file: File): Promise<PracticeMedia> {
  const existingVideos = await db.practiceMedia
    .where('practiceId')
    .equals(practiceId)
    .filter((item) => item.mediaType === 'video')
    .toArray()

  const id = (await db.practiceMedia.add({
    practiceId,
    mediaType: 'video',
    blob: file,
    fileName: file.name,
    mimeType: file.type || undefined,
    sortOrder: existingVideos.length,
  })) as number

  const saved = await db.practiceMedia.get(id)
  if (!saved) throw new Error('Failed to save practice video')
  return saved
}

export async function deletePracticeMedia(mediaId: number): Promise<void> {
  await db.practiceMedia.delete(mediaId)
}

export async function savePracticeMedia(
  practiceId: number,
  data: {
    image: File | null
    removeImage: boolean
    videos: File[]
    removeVideoIds: number[]
  },
): Promise<void> {
  if (data.removeImage) {
    const existing = await db.practiceMedia
      .where('practiceId')
      .equals(practiceId)
      .filter((item) => item.mediaType === 'image')
      .toArray()
    await db.practiceMedia.bulkDelete(existing.map((item) => item.id!).filter(Boolean))
  }
  if (data.image) {
    await replacePracticeImage(practiceId, data.image)
  }

  if (data.removeVideoIds.length) {
    await db.practiceMedia.bulkDelete(data.removeVideoIds)
  }

  for (const video of data.videos) {
    await addPracticeVideo(practiceId, video)
  }
}

export function mediaToObjectUrl(media: PracticeMedia): string {
  return URL.createObjectURL(media.blob)
}

export function mediaTypeLabel(type: PracticeMediaType): string {
  return type === 'image' ? 'image' : 'video'
}
