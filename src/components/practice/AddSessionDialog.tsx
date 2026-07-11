import { useState } from 'react'
import { startOfDay } from '../../lib/dates'

interface AddSessionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (count: number, date: Date, note: string) => void
}

export function AddSessionDialog({ open, onClose, onConfirm }: AddSessionDialogProps) {
  const [count, setCount] = useState(1)
  const [date, setDate] = useState(() => startOfDay().toISOString().slice(0, 10))
  const [note, setNote] = useState('')

  if (!open) return null

  const handleConfirm = () => {
    if (count <= 0) return
    onConfirm(count, startOfDay(new Date(date)), note)
    setCount(1)
    setNote('')
    setDate(startOfDay().toISOString().slice(0, 10))
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
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
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
          <button type="button" onClick={handleConfirm} className="btn-primary flex-1 px-4 py-2.5">
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