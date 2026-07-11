import { useRef, useState } from 'react'
import { Paperclip, Trash2 } from 'lucide-react'
import { UnsupportedPracticeMediaFormatError, validateImageFile, validateVideoFile } from '../../lib/practiceMediaFormats'
import type { PracticeMedia } from '../../lib/db'

export interface PendingPracticeVideo {
  key: string
  file: File
  fileName: string
}

interface PracticeMediaSectionProps {
  existingImage: PracticeMedia | null
  existingVideos: PracticeMedia[]
  onImageChange: (file: File | null) => void
  onVideosAdd: (files: File[]) => void
  onRemoveExistingImage: () => void
  onRemoveExistingVideo: (mediaId: number) => void
  onRemovePendingVideo: (key: string) => void
  pendingImageName: string | null
  pendingVideos: PendingPracticeVideo[]
}

export function PracticeMediaSection({
  existingImage,
  existingVideos,
  onImageChange,
  onVideosAdd,
  onRemoveExistingImage,
  onRemoveExistingVideo,
  onRemovePendingVideo,
  pendingImageName,
  pendingVideos,
}: PracticeMediaSectionProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const showImage = existingImage?.fileName ?? pendingImageName

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      validateImageFile(file)
      setError(null)
      onImageChange(file)
    } catch (err) {
      setError(err instanceof UnsupportedPracticeMediaFormatError ? err.message : 'Не удалось добавить файл')
    }
  }

  const handleVideoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    try {
      files.forEach(validateVideoFile)
      setError(null)
      onVideosAdd(files)
    } catch (err) {
      setError(err instanceof UnsupportedPracticeMediaFormatError ? err.message : 'Не удалось добавить файл')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-3">
      <h4 className="text-sm font-medium text-[var(--color-primary)]">Визуализация</h4>

      <div>
        <p className="mb-1 text-sm text-[var(--text-muted)]">Картинка</p>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="btn-secondary flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm"
        >
          <Paperclip className="h-4 w-4" />
          Выбрать картинку
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImagePick}
          className="hidden"
        />
        {showImage ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-sm text-[var(--text-muted)]">{showImage}</span>
            <button
              type="button"
              onClick={() => {
                if (pendingImageName) onImageChange(null)
                else onRemoveExistingImage()
              }}
              className="shrink-0 p-1 text-red-600"
              aria-label="Удалить картинку"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="mt-1 text-xs text-[var(--text-muted)]">Одна картинка (JPG, PNG, WebP, GIF)</p>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm text-[var(--text-muted)]">Видео</p>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="btn-secondary flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm"
        >
          <Paperclip className="h-4 w-4" />
          Добавить видео
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/3gpp,video/x-matroska"
          multiple
          onChange={handleVideoPick}
          className="hidden"
        />
        <div className="mt-2 flex flex-col gap-2">
          {existingVideos.map((video) => (
            <div key={video.id} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm text-[var(--text-muted)]">{video.fileName}</span>
              <button
                type="button"
                onClick={() => video.id && onRemoveExistingVideo(video.id)}
                className="shrink-0 p-1 text-red-600"
                aria-label="Удалить видео"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {pendingVideos.map((video) => (
            <div key={video.key} className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm text-[var(--text-muted)]">{video.fileName}</span>
              <button
                type="button"
                onClick={() => onRemovePendingVideo(video.key)}
                className="shrink-0 p-1 text-red-600"
                aria-label="Удалить видео"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {!existingVideos.length && !pendingVideos.length && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Можно добавить несколько видео (MP4, WebM, 3GP, MKV)
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
