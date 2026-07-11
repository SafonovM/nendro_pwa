import { useState, useEffect, useMemo } from 'react'
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
import { formatPracticeCount } from '../../lib/format'

interface PracticeFormProps {
  practiceId?: number
  onDone?: () => void
}

export function PracticeForm({ practiceId, onDone }: PracticeFormProps) {
  const addPractice = usePracticeStore((s) => s.addPractice)
  const updatePractice = usePracticeStore((s) => s.updatePractice)
  const loadPractices = usePracticeStore((s) => s.loadPractices)

  const isEdit = practiceId !== undefined

  const [category, setCategory] = useState<PracticeCategory>('refuge')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetCount, setTargetCount] = useState(1000)
  const [planDays, setPlanDays] = useState(NGONDRO_PLAN_DAYS)
  const [nameError, setNameError] = useState(false)
  const [planDaysError, setPlanDaysError] = useState(false)
  const [targetCountError, setTargetCountError] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  const isNgondro = isNgondroCategory(category)
  const isFlexible = usesFlexibleTarget(category)

  const effectiveTarget = isNgondro ? NGONDRO_TOTAL : targetCount
  const dailyNormPreview = useMemo(
    () => calcDailyNorm(effectiveTarget, planDays),
    [effectiveTarget, planDays],
  )

  useEffect(() => {
    if (!practiceId) return
    loadPractices().then(() => {
      const practice = usePracticeStore.getState().practices.find((p) => p.id === practiceId)
      if (practice) {
        setCategory(practice.category)
        setName(practice.name)
        setDescription(practice.description ?? '')
        setTargetCount(practice.targetCount)
        setPlanDays(practice.planDays)
      }
      setLoading(false)
    })
  }, [practiceId, loadPractices])

  const handleCategoryChange = (c: PracticeCategory) => {
    setCategory(c)
    if (!isEdit) {
      setPlanDays(isNgondroCategory(c) ? NGONDRO_PLAN_DAYS : 0)
      const label = PRACTICE_CATEGORY_LABELS[c]
      if (!name.trim() || Object.values(PRACTICE_CATEGORY_LABELS).includes(name)) {
        setName(label)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    const nameInvalid = isEdit ? !trimmedName : false
    const planInvalid = isNgondro && planDays <= 0
    const targetInvalid = isFlexible && targetCount <= 0

    setNameError(nameInvalid)
    setPlanDaysError(planInvalid)
    setTargetCountError(targetInvalid)

    if (nameInvalid || planInvalid || targetInvalid) return

    const resolvedName = trimmedName || PRACTICE_CATEGORY_LABELS[category]

    if (isEdit && practiceId) {
      await updatePractice(practiceId, {
        name: resolvedName,
        category,
        description: description.trim() || undefined,
        targetCount: isFlexible ? targetCount : undefined,
        planDays,
      })
    } else {
      await addPractice({
        name: resolvedName,
        category,
        description: description.trim() || undefined,
        targetCount: isFlexible ? targetCount : undefined,
        planDays,
      })
    }

    onDone?.()
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm'

  if (loading) {
    return <p className="p-4 text-[var(--text-muted)]">Загрузка…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-4 mb-4 flex flex-col gap-3 p-4">
      <h3 className="font-medium">{isEdit ? 'Редактировать практику' : 'Новая практика'}</h3>

      <label className="mb-1 block text-sm text-[var(--text-muted)]">Категория</label>
      <select
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value as PracticeCategory)}
        className={inputClass}
      >
        {[...NGONDRO_CATEGORIES, ...FLEXIBLE_TARGET_CATEGORIES].map((c) => (
          <option key={c} value={c}>
            {PRACTICE_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>

      <label className="mb-1 block text-sm text-[var(--text-muted)]">
        Название{isEdit ? '' : ' (необязательно)'}
      </label>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setNameError(false)
        }}
        placeholder={PRACTICE_CATEGORY_LABELS[category]}
        className={`${inputClass}${nameError ? ' border-red-500' : ''}`}
      />
      {nameError && <p className="text-xs text-red-600">Укажите название</p>}

      {isFlexible && (
        <>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />

          <label className="mb-1 block text-sm text-[var(--text-muted)]">Целевое количество</label>
          <input
            type="number"
            min={1}
            value={targetCount}
            onChange={(e) => {
              setTargetCount(Math.max(1, Number(e.target.value) || 1))
              setTargetCountError(false)
            }}
            className={`${inputClass}${targetCountError ? ' border-red-500' : ''}`}
          />
          {targetCountError && <p className="text-xs text-red-600">Укажите целевое количество</p>}
        </>
      )}

      {!isFlexible && (
        <>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">Общее количество</label>
          <input
            type="text"
            readOnly
            value={formatPracticeCount(NGONDRO_TOTAL)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-variant)] px-3 py-2 text-sm"
          />
        </>
      )}

      <label className="mb-1 block text-sm text-[var(--text-muted)]">Срок выполнения (дней)</label>
      <input
        type="number"
        min={0}
        value={planDays}
        onChange={(e) => {
          setPlanDays(Math.max(0, Number(e.target.value) || 0))
          setPlanDaysError(false)
        }}
        className={`${inputClass}${planDaysError ? ' border-red-500' : ''}`}
      />
      {planDaysError && <p className="text-xs text-red-600">Укажите срок больше 0</p>}
      <p className="text-xs text-[var(--text-muted)]">
        {!isNgondro && planDays === 0
          ? '0 — без дневной нормы'
          : dailyNormPreview > 0
            ? `Дневная норма: ${formatPracticeCount(dailyNormPreview)}`
            : 'Укажите срок для расчёта дневной нормы'}
      </p>

      <button type="submit" className="btn-primary px-4 py-3">
        {isEdit ? 'Сохранить' : 'Создать'}
      </button>
    </form>
  )
}
