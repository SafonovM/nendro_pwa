import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Header } from '../components/layout/Header'
import {
  addSanghaPracticeCount,
  fetchSanghaPractices,
  type SanghaPractice,
} from '../lib/sanghaAccumulation'
import { useSanghaAccumulationStore } from '../store/sanghaAccumulationStore'

function formatCount(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n)
}

export function SanghaAccumulation() {
  const scriptUrl = useSanghaAccumulationStore((s) => s.scriptUrl)
  const accessVerified = useSanghaAccumulationStore((s) => s.accessVerified)

  const [practices, setPractices] = useState<SanghaPractice[]>([])
  const [selected, setSelected] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedPractice = practices.find((p) => p.practice === selected)

  const loadPractices = useCallback(async () => {
    if (!scriptUrl || !accessVerified) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const list = await fetchSanghaPractices(scriptUrl)
      setPractices(list)
      setSelected((prev) => {
        if (prev && list.some((p) => p.practice === prev)) return prev
        return list[0]?.practice ?? ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [scriptUrl, accessVerified])

  useEffect(() => {
    void loadPractices()
  }, [loadPractices])

  const handleSubmit = async () => {
    const add = Number(amount)
    if (!selected) {
      setError('Выберите практику')
      return
    }
    if (!Number.isInteger(add) || add <= 0) {
      setError('Введите целое число больше 0')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await addSanghaPracticeCount(scriptUrl, selected, add)
      setSuccess(
        `Внесено ${formatCount(add)}. Теперь ${result.practice}: ${formatCount(result.total ?? 0)}`,
      )
      setAmount('')
      setPractices((prev) =>
        prev.map((p) =>
          p.practice === result.practice
            ? { ...p, total: result.total ?? p.total + add }
            : p,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось внести')
    } finally {
      setSubmitting(false)
    }
  }

  if (!accessVerified || !scriptUrl) {
    return (
      <>
        <Header title="Накопление" />
        <div className="p-4">
          <div className="card p-4 text-sm text-[var(--text-muted)]">
            Сначала укажите ссылку на Google Apps Script в настройках и нажмите
            «Проверить доступ».
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Накопление" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-[var(--text-muted)]">
            Общий счётчик сангхи (Google Таблица)
          </p>
          <button
            type="button"
            onClick={() => void loadPractices()}
            disabled={loading || submitting}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] disabled:opacity-50"
            aria-label="Обновить"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <section className="card p-4">
          <label className="mb-2 block text-sm font-medium">Практика</label>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value)
              setError(null)
              setSuccess(null)
            }}
            disabled={loading || practices.length === 0}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm"
          >
            {practices.length === 0 && <option value="">Нет активных практик</option>}
            {practices.map((p) => (
              <option key={p.practice} value={p.practice}>
                {p.practice}
              </option>
            ))}
          </select>

          <div className="mt-4 rounded-xl bg-[var(--bg)] px-3 py-3">
            <p className="text-xs text-[var(--text-muted)]">Сейчас накоплено</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-primary)]">
              {selectedPractice ? formatCount(selectedPractice.total) : '—'}
            </p>
          </div>
        </section>

        <section className="card p-4">
          <label className="mb-2 block text-sm font-medium">Сколько добавить</label>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError(null)
              setSuccess(null)
            }}
            placeholder="например 108"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || loading || !selected}
            className="btn-primary mt-3 w-full px-4 py-2.5 disabled:opacity-60"
          >
            {submitting ? 'Вносим…' : 'Внести'}
          </button>
        </section>

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </p>
        )}
      </div>
    </>
  )
}
