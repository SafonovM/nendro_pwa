export interface SanghaPractice {
  practice: string
  total: number
  row?: number
}

interface PracticesResponse {
  ok: boolean
  practices?: SanghaPractice[]
  error?: string
}

interface AddResponse {
  ok: boolean
  practice?: string
  previous?: number
  added?: number
  total?: number
  error?: string
}

function normalizeScriptUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  try {
    const url = new URL(trimmed)
    // Drop accidental query/hash from copied links
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return trimmed
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  const data = (await response.json()) as T
  return data
}

export function isLikelyAppsScriptUrl(raw: string): boolean {
  const url = normalizeScriptUrl(raw)
  return /script\.google\.com\/macros\/s\//i.test(url)
}

export async function fetchSanghaPractices(scriptUrl: string): Promise<SanghaPractice[]> {
  const base = normalizeScriptUrl(scriptUrl)
  if (!base) throw new Error('Укажите ссылку на скрипт')
  if (!isLikelyAppsScriptUrl(base)) {
    throw new Error('Ожидается ссылка вида script.google.com/macros/s/.../exec')
  }

  const data = await fetchJson<PracticesResponse>(base)
  if (!data.ok) {
    throw new Error(data.error || 'Не удалось загрузить практики')
  }
  return (data.practices ?? []).filter((item) => item.practice?.trim())
}

export async function verifySanghaScriptAccess(scriptUrl: string): Promise<SanghaPractice[]> {
  const practices = await fetchSanghaPractices(scriptUrl)
  if (practices.length === 0) {
    throw new Error('Доступ есть, но активных практик не найдено')
  }
  return practices
}

export async function addSanghaPracticeCount(
  scriptUrl: string,
  practice: string,
  add: number,
): Promise<AddResponse> {
  const base = normalizeScriptUrl(scriptUrl)
  if (!base) throw new Error('Укажите ссылку на скрипт')
  if (!practice.trim()) throw new Error('Выберите практику')
  if (!Number.isInteger(add) || add <= 0) {
    throw new Error('Введите целое число больше 0')
  }

  const url = new URL(base)
  url.searchParams.set('action', 'add')
  url.searchParams.set('practice', practice.trim())
  url.searchParams.set('add', String(add))

  const data = await fetchJson<AddResponse>(url.toString())
  if (!data.ok) {
    throw new Error(data.error || 'Не удалось внести накопление')
  }
  return data
}
