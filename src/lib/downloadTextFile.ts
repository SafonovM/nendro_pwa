type SaveTextFileResult = 'save-picker' | 'directory-picker' | 'download' | 'share' | 'open'

interface FilePickerAcceptType {
  description?: string
  accept: Record<string, string[]>
}

interface SaveFilePickerOptions {
  suggestedName?: string
  types?: FilePickerAcceptType[]
}

interface DirectoryPickerOptions {
  mode?: 'read' | 'readwrite'
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: BufferSource | Blob | string): Promise<void>
  close(): Promise<void>
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>
}

interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
}

type FileSystemAccessWindow = Window & {
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>
  showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>
}

function createBackupBlob(content: string, mimeType: string): Blob {
  return new Blob([content], { type: `${mimeType};charset=utf-8` })
}

function backupPickerTypes(mimeType: string): FilePickerAcceptType[] {
  if (mimeType === 'application/json') {
    return [
      {
        description: 'JSON',
        accept: { 'application/json': ['.json'] },
      },
    ]
  }
  return [{ description: 'Файл', accept: { [mimeType]: [] } }]
}

async function writeBlobToHandle(handle: FileSystemFileHandle, blob: Blob): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(blob)
  await writable.close()
}

async function saveWithFilePicker(
  filename: string,
  blob: Blob,
  mimeType: string,
): Promise<boolean> {
  const pickerWindow = window as FileSystemAccessWindow
  if (!pickerWindow.showSaveFilePicker) return false

  const handle = await pickerWindow.showSaveFilePicker({
    suggestedName: filename,
    types: backupPickerTypes(mimeType),
  })
  await writeBlobToHandle(handle, blob)
  return true
}

async function saveWithDirectoryPicker(filename: string, blob: Blob): Promise<boolean> {
  const pickerWindow = window as FileSystemAccessWindow
  if (!pickerWindow.showDirectoryPicker) return false

  const directory = await pickerWindow.showDirectoryPicker({ mode: 'readwrite' })
  const handle = await directory.getFileHandle(filename, { create: true })
  await writeBlobToHandle(handle, blob)
  return true
}

export async function saveTextFile(
  filename: string,
  content: string,
  mimeType = 'application/json',
): Promise<SaveTextFileResult> {
  const blob = createBackupBlob(content, mimeType)

  try {
    if (await saveWithFilePicker(filename, blob, mimeType)) {
      return 'save-picker'
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
  }

  try {
    if (await saveWithDirectoryPicker(filename, blob)) {
      return 'directory-picker'
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
  }

  return downloadTextFile(filename, content, mimeType)
}

export async function downloadTextFile(
  filename: string,
  content: string,
  mimeType = 'application/json',
): Promise<Exclude<SaveTextFileResult, 'save-picker' | 'directory-picker'>> {
  const blob = createBackupBlob(content, mimeType)

  if (typeof File !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([blob], filename, { type: mimeType })
      const canShareFiles =
        typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] })
      if (canShareFiles) {
        await navigator.share({ files: [file], title: filename })
        return 'share'
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }
    }
  }

  const url = URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.rel = 'noopener'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    await new Promise((resolve) => window.setTimeout(resolve, 500))
    return 'download'
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return 'open'
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
  }
}

export async function copyTextToClipboard(content: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = content
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
