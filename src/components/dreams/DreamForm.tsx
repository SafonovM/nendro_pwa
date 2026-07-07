import { useState } from 'react'
import { DREAM_CATEGORY_LABELS, type DreamCategory } from '../../lib/types'
import { useDreamStore } from '../../store/dreamStore'
import { VoiceInput } from './VoiceInput'

interface DreamFormProps {
  onDone?: () => void
}

export function DreamForm({ onDone }: DreamFormProps) {
  const addDream = useDreamStore((s) => s.addDream)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<DreamCategory>('ordinary')
  const [emotions, setEmotions] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    await addDream({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      category,
      emotions: emotions.trim(),
      isSignificant: category !== 'ordinary',
    })
    setTitle('')
    setDescription('')
    setEmotions('')
    onDone?.()
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30'

  return (
    <form onSubmit={handleSubmit} className="card mx-4 mb-4 flex flex-col gap-3 p-4">
      <h3 className="font-medium">Новый сон</h3>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Дата</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Заголовок</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Категория</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DreamCategory)}
          className={inputClass}
        >
          {(Object.keys(DREAM_CATEGORY_LABELS) as DreamCategory[]).map((c) => (
            <option key={c} value={c}>
              {DREAM_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm text-[var(--text-muted)]">Описание</label>
          <VoiceInput onTranscript={(text) => setDescription((prev) => prev + text)} />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-[var(--text-muted)]">Эмоции</label>
        <input value={emotions} onChange={(e) => setEmotions(e.target.value)} className={inputClass} />
      </div>

      <button type="submit" className="btn-primary px-4 py-3">
        Сохранить
      </button>
    </form>
  )
}
