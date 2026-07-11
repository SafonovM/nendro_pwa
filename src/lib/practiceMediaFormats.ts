export const SUPPORTED_VIDEO_LABEL = 'MP4, WebM, 3GP, MKV'
export const SUPPORTED_IMAGE_LABEL = 'JPG, PNG, WebP, GIF'

const supportedVideoExtensions = new Set(['mp4', 'webm', '3gp', 'mkv'])
const supportedVideoMimeTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/3gpp',
  'video/x-matroska',
])

const supportedImageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
const supportedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function extensionFrom(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export function isSupportedVideo(fileName: string, mimeType?: string): boolean {
  if (supportedVideoExtensions.has(extensionFrom(fileName))) return true
  return mimeType ? supportedVideoMimeTypes.has(mimeType.toLowerCase()) : false
}

export function isSupportedImage(fileName: string, mimeType?: string): boolean {
  if (supportedImageExtensions.has(extensionFrom(fileName))) return true
  return mimeType ? supportedImageMimeTypes.has(mimeType.toLowerCase()) : false
}

export class UnsupportedPracticeMediaFormatError extends Error {
  readonly supportedFormatsLabel: string
  readonly isImage: boolean

  constructor(supportedFormatsLabel: string, isImage: boolean) {
    super(
      isImage
        ? `Добавьте изображение одного из форматов: ${supportedFormatsLabel}`
        : `Добавьте видео одного из форматов: ${supportedFormatsLabel}`,
    )
    this.name = 'UnsupportedPracticeMediaFormatError'
    this.supportedFormatsLabel = supportedFormatsLabel
    this.isImage = isImage
  }
}

export function validateImageFile(file: File): void {
  if (!isSupportedImage(file.name, file.type)) {
    throw new UnsupportedPracticeMediaFormatError(SUPPORTED_IMAGE_LABEL, true)
  }
}

export function validateVideoFile(file: File): void {
  if (!isSupportedVideo(file.name, file.type)) {
    throw new UnsupportedPracticeMediaFormatError(SUPPORTED_VIDEO_LABEL, false)
  }
}
