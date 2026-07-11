import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import {
  PRACTICE_CATEGORY_LABELS,
  NGONDRO_CATEGORIES,
  FLEXIBLE_TARGET_CATEGORIES,
  usesFlexibleTarget,
  isNgondroCategory,
  NGONDRO_TOTAL,
  NGONDRO_PLAN_DAYS,
  type PracticeCategory,
} from '../../lib/types'
import { usePracticeStore, calcDailyNorm } from '../../store/practiceStore'
import { PracticeCard } from './PracticeCard'
import { EmptyState } from '../ui/EmptyState'
import { formatPracticeCount } from '../../lib/format'

export function PracticeList() {
  const practices = usePracticeStore((s) => s.practices)
  const addPractice = usePracticeStore((s) => s.addPractice)
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<PracticeCategory>('refuge')
  const [name, setName] = useState('')
  const [targetCount, setTargetCount] = useState(1000)
  const [planDays, setPlanDays] = useState(NGONDRO_PLAN_DAYS)

  const isNgondro = isNgondroCategory(category)
  const isFlexible = usesFlexibleTarget(category)

  const effectiveTarget = isNgondro ? NGONDRO_TOTAL : targetCount
  const dailyNormPreview = useMemo(
    () => calcDailyNorm(effectiveTarget, planDays),
    [effectiveTarget, planDays],
  )

  const handleCategoryChange = (c: PracticeCategory) => {
    setCategory(c)
    setPlanDays(isNgondroCategory(c) ? NGONDRO_PLAN_DAYS : 0)
  }

  const handleAdd = async () => {
    const label = PRACTICE_CATEGORY_LABELS[category]
    await addPractice({
      name: name.trim() || label,
      category,
      targetCount: isFlexible ? targetCount : undefined,
      planDays,
    })
    setShowForm(false)
    setName('')
    setCategory('refuge')
    setTargetCount(1000)
    setPlanDays(NGONDRO_PLAN_DAYS)
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
            onChange={(e) => handleCategoryChange(e.target.value as PracticeCategory)}
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

          {isFlexible ? (
            <>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">Целевое количество</label>
              <input
                type="number"
                min={1}
                value={targetCount}
                onChange={(e) => setTargetCount(Math.max(1, Number(e.target.value) || 1))}
                className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
            </>
          ) : (
            <>
              <label className="mb-1 block text-sm text-[var(--text-muted)]">Общее количество</label>
              <input
                type="text"
                readOnly
                value={formatPracticeCount(NGONDRO_TOTAL)}
                className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-variant)] px-3 py-2 text-sm"
              />
            </>
          )}

          <label className="mb-1 block text-sm text-[var(--text-muted)]">Срок выполнения (дней)</label>
          <input
            type="number"
            min={0}
            value={planDays}
            onChange={(e) => setPlanDays(Math.max(0, Number(e.target.value) || 0))}
            className="mb-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm"
          />
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            {!isNgondro && planDays === 0
              ? '0 — без дневной нормы'
              : dailyNormPreview > 0
                ? `Дневная норма: ${formatPracticeCount(dailyNormPreview)}`
                : 'Укажите срок для расчёта дневной нормы'}
          </p>

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
