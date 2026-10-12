import { useEffect, useState } from 'react'
import { startOfDay } from '../../lib/dates'

interface AddSessionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (count: number, date: Date, note: string) => void
}

function toLocalDateInput(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromLocalDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return startOfDay()
  return new Date(y, m - 1, d)
}

export function AddSessionDialog({ open, onClose, onConfirm }: AddSessionDialogProps) {
  const [countInput, setCountInput] = useState('1')
  const [date, setDate] = useState(() => toLocalDateInput())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setCountInput('1')
    setNote('')
    setDate(toLocalDateInput())
  }, [open])

  if (!open) return null

  const count = Number(countInput)
  const isCountValid = countInput !== '' && Number.isSafeInteger(count) && count > 0

  const handleConfirm = () => {
    if (!isCountValid) return
    onConfirm(count, startOfDay(fromLocalDateInput(date)), note)
    setCountInput('1')
    setNote('')
    setDate(toLocalDateInput())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="card w-full max-w-md p-4">
        <h3 className="mb-4 font-display text-lg font-semibold text-[var(--color-primary)]">
          Добавить подход
        </h3>

        <label className="mb-1 block text-sm text-[var(--text-muted)]">Количество</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={countInput}
          onChange={(e) => setCountInput(e.target.value.replace(/\D/g, '').slice(0, 9))}
          onFocus={(e) => e.target.select()}
          className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
        />

        <label className="mb-1 block text-sm text-[var(--text-muted)]">Дата</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
        />

        <label className="mb-1 block text-sm text-[var(--text-muted)]">Заметка (необязательно)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isCountValid}
            className="btn-primary flex-1 px-4 py-2.5 disabled:opacity-50"
          >
            Добавить
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1 px-4 py-2.5">
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}
