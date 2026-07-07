import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  PRACTICE_CATEGORY_LABELS,
  NGONDRO_CATEGORIES,
  FLEXIBLE_TARGET_CATEGORIES,
  usesFlexibleTarget,
  type PracticeCategory,
} from '../../lib/types'
import { usePracticeStore } from '../../store/practiceStore'
import { PracticeCard } from './PracticeCard'
import { EmptyState } from '../ui/EmptyState'

export function PracticeList() {
  const practices = usePracticeStore((s) => s.practices)
  const addPractice = usePracticeStore((s) => s.addPractice)
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<PracticeCategory>('refuge')
  const [name, setName] = useState('')
  const [targetCount, setTargetCount] = useState(1000)

  const handleAdd = async () => {
    const label = PRACTICE_CATEGORY_LABELS[category]
    await addPractice({
      name: name.trim() || label,
      category,
      targetCount: usesFlexibleTarget(category) ? targetCount : undefined,
    })
    setShowForm(false)
    setName('')
    setCategory('refuge')
  }

  if (practices.length === 0 && !showForm) {
    return (
      <>
        <EmptyState
          title="Практики не добавлены"
          subtitle="Создайте практику Нёндро или выберите из предустановленных категорий"
        />
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-3"
          >
            <Plus className="h-5 w-5" />
            Добавить практику
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {practices.map((p) => (
        <PracticeCard key={p.id} practice={p} />
      ))}

      {showForm ? (
        <div className="card p-4">
          <h3 className="mb-3 font-medium">Новая практика</h3>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PracticeCategory)}
            className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          >
            {[...NGONDRO_CATEGORIES, ...FLEXIBLE_TARGET_CATEGORIES].map((c) => (
              <option key={c} value={c}>
                {PRACTICE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Название (необязательно)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={PRACTICE_CATEGORY_LABELS[category]}
            className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
          {usesFlexibleTarget(category) && (
            <>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">Цель</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={handleAdd} className="btn-primary flex-1 px-4 py-2.5">
              Создать
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary flex-1 px-4 py-2.5"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-secondary flex items-center justify-center gap-2 px-4 py-3"
        >
          <Plus className="h-5 w-5" />
          Добавить практику
        </button>
      )}
    </div>
  )
}
