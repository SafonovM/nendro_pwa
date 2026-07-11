export async function downloadTextFile(
  filename: string,
  content: string,
  mimeType = 'application/json',
): Promise<'download' | 'share' | 'open' | 'clipboard'> {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })

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
