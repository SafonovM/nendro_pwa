import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DREAM_CATEGORY_LABELS, type DreamCategory } from '../../lib/types'
import { useDreamStore } from '../../store/dreamStore'
import { VoiceInput } from './VoiceInput'

interface DreamFormProps {
  dreamId?: number
  onDone?: (dreamId: number) => void
}

export function DreamForm({ dreamId, onDone }: DreamFormProps) {
  const navigate = useNavigate()
  const addDream = useDreamStore((s) => s.addDream)
  const updateDream = useDreamStore((s) => s.updateDream)
  const loadDreams = useDreamStore((s) => s.loadDreams)

  const isEdit = dreamId !== undefined

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [category, setCategory] = useState<DreamCategory>('ordinary')
  const [emotions, setEmotions] = useState('')
  const [voicePreview, setVoicePreview] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!dreamId) return
    void loadDreams().then(() => {
      const dream = useDreamStore.getState().dreams.find((d) => d.id === dreamId)
      if (dream) {
        setTitle(dream.title)
        setDescription(dream.description)
        setCategory(dream.category)
        setEmotions(dream.emotions)
        const dreamDate = dream.date instanceof Date ? dream.date : new Date(dream.date)
        setDate(dreamDate.toISOString().slice(0, 10))
      }
      setLoading(false)
    })
  }, [dreamId, loadDreams])

  const appendDescription = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setDescription((prev) => {
      const current = prev.trim()
      return current ? `${current} ${trimmed}` : trimmed
    })
    setVoicePreview('')
  }, [])

  const descriptionValue = useMemo(() => {
    if (!voicePreview) return description
    const current = description.trim()
    return current ? `${current} ${voicePreview}` : voicePreview
  }, [description, voicePreview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      category,
      emotions: emotions.trim(),
      isSignificant: category !== 'ordinary',
    }

    if (isEdit && dreamId) {
      await updateDream(dreamId, payload)
      if (onDone) {
        onDone(dreamId)
      } else {
        navigate(`/dreams/${dreamId}`)
      }
      return
    }

    const newDreamId = await addDream(payload)
    setTitle('')
    setDescription('')
    setEmotions('')
    if (onDone) {
      onDone(newDreamId)
    } else {
      navigate(`/dreams/${newDreamId}`)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30'

  if (loading) {
    return <p className="p-4 text-[var(--text-muted)]">Загрузка…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-4 mb-4 flex flex-col gap-3 p-4">
      <h3 className="font-medium">{isEdit ? 'Редактирование сна' : 'Новый сон'}</h3>

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
          <VoiceInput
            onFinalTranscript={appendDescription}
            onInterimTranscript={setVoicePreview}
          />
        </div>
        <textarea
          value={descriptionValue}
          onChange={(e) => {
            setVoicePreview('')
            setDescription(e.target.value)
          }}
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
