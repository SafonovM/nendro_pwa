import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { AddSessionDialog } from '../components/practice/AddSessionDialog'
import { PracticeHistorySection } from '../components/practice/PracticeHistorySection'
import { PracticeVisualizationSection } from '../components/practice/PracticeVisualizationSection'
import { VirtualMalaCounter } from '../components/practice/VirtualMalaCounter'
import { GradientCircularProgress } from '../components/ui/GradientCircularProgress'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { usePracticeStore, getPracticeStats } from '../store/practiceStore'
import { useSettingsStore } from '../store/settingsStore'
import { PRACTICE_CATEGORY_LABELS } from '../lib/types'
import { hasVisualization, resolveVisualization, resolveCustomVisualization } from '../lib/practiceVisualization'
import { getPracticeMedia, mediaToObjectUrl } from '../lib/practiceMedia'
import type { PracticeVisualization } from '../lib/practiceVisualization'
import { getTodayCount, groupSessionsByMonth } from '../lib/backup'
import { formatPracticeCount } from '../lib/format'
import type { PracticeSession } from '../lib/db'

const MALA_BEAD_COUNT = 108
const QUICK_ADD_AMOUNTS = [27, 108]
const DELETE_CONFIRM_MESSAGE = 'Вы действительно хотите удалить запись?'

export function PracticeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const practices = usePracticeStore((s) => s.practices)
  const loadPractices = usePracticeStore((s) => s.loadPractices)
  const addMalaRepetition = usePracticeStore((s) => s.addMalaRepetition)
  const quickAddSession = usePracticeStore((s) => s.quickAddSession)
  const addSession = usePracticeStore((s) => s.addSession)
  const getSessions = usePracticeStore((s) => s.getSessions)
  const deletePractice = usePracticeStore((s) => s.deletePractice)
  const practitionerGender = useSettingsStore((s) => s.practitionerGender)

  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [customVisualization, setCustomVisualization] = useState<PracticeVisualization | null>(null)
  const [malaCountInRound, setMalaCountInRound] = useState(0)
  const [malaCompletedRounds, setMalaCompletedRounds] = useState(0)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const activeMalaSessionId = useRef<number | null>(null)

  const practiceId = Number(id)
  const practice = practices.find((p) => p.id === practiceId)

  const visualization = useMemo(() => {
    if (!practice) return null
    if (practice.category === 'custom') return customVisualization
    if (!hasVisualization(practice.category)) return null
    return resolveVisualization(practice.category, practitionerGender)
  }, [practice, practitionerGender, customVisualization])

  useEffect(() => {
    if (!practiceId || !practice || practice.category !== 'custom') {
      setCustomVisualization(null)
      return
    }

    const objectUrls: string[] = []
    let cancelled = false

    void getPracticeMedia(practiceId).then(({ image, videos }) => {
      const posterUrl = image ? mediaToObjectUrl(image) : null
      if (posterUrl) objectUrls.push(posterUrl)
      const videoUrls = videos.map((video) => {
        const url = mediaToObjectUrl(video)
        objectUrls.push(url)
        return url
      })

      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url))
        return
      }

      setCustomVisualization(resolveCustomVisualization(posterUrl, videoUrls))
    })

    return () => {
      cancelled = true
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [practice, practiceId])

  const reloadSessions = async () => {
    if (!practiceId) return
    const list = await getSessions(practiceId)
    setSessions(list)
  }

  useEffect(() => {
    loadPractices()
  }, [loadPractices])

  useEffect(() => {
    void reloadSessions()
  }, [practiceId, practices])

  if (!practice) {
    return (
      <>
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h1 className="font-display text-xl font-semibold text-[var(--color-primary)]">Практика</h1>
        </div>
        <p className="p-4 text-[var(--text-muted)]">Практика не найдена</p>
      </>
    )
  }

  const { remaining, completionPercent, dailyNorm } = getPracticeStats(practice)
  const label = PRACTICE_CATEGORY_LABELS[practice.category]
  const todayCount = getTodayCount(sessions, practiceId)
  const historyGroups = groupSessionsByMonth(sessions)
  const isDailyNormMet = dailyNorm > 0 && todayCount >= dailyNorm

  const handleDelete = async () => {
    await deletePractice(practiceId)
    navigate('/practices')
  }

  const handleMalaTap = async () => {
    const result = await addMalaRepetition(practiceId, activeMalaSessionId.current)
    activeMalaSessionId.current = result.sessionId

    setMalaCountInRound((prev) => {
      const next = prev >= MALA_BEAD_COUNT ? 1 : prev + 1
      if (next === MALA_BEAD_COUNT) {
        setMalaCompletedRounds((r) => r + 1)
      }
      return next
    })

    await reloadSessions()
  }

  const handleQuickAdd = async (amount: number) => {
    activeMalaSessionId.current = null
    await quickAddSession(practiceId, amount)
    await reloadSessions()
  }

  const handleAddSession = async (count: number, date: Date, note: string) => {
    activeMalaSessionId.current = null
    await addSession(practiceId, count, date, note)
    await reloadSessions()
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display flex-1 truncate text-xl font-semibold text-[var(--color-primary)]">
          {practice.name}
        </h1>
        <Link
          to={`/practices/${practiceId}/edit`}
          className="p-1 text-[var(--text-muted)]"
          aria-label="Редактировать"
        >
          <Pencil className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          aria-label="Удалить"
        >
          <Trash2 className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <p className="text-sm text-[var(--text-muted)]">{label}</p>
          {practice.description && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{practice.description}</p>
          )}
          <div className="mt-4">
            <GradientCircularProgress percent={completionPercent}>
              <p className="text-2xl font-bold text-[var(--color-primary)]">
                {completionPercent.toFixed(0)}%
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {formatPracticeCount(practice.completedCount)} /{' '}
                {formatPracticeCount(practice.targetCount)}
              </p>
            </GradientCircularProgress>
          </div>
        </div>

        {visualization && (
          <div className="mb-4">
            <PracticeVisualizationSection visualization={visualization} />
          </div>
        )}

        {practice.planDays > 0 && (
          <div className="card mb-4 p-4">
            <h3 className="mb-2 font-medium text-[var(--color-primary)]">План выполнения</h3>
            <p className="mb-3 text-sm text-[var(--text-muted)]">
              {practice.planDays} дней • цель {formatPracticeCount(practice.targetCount)}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-semibold tabular-nums text-[var(--color-primary)]">
                  {formatPracticeCount(dailyNorm)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Норма/день</p>
              </div>
              <div>
                <p
                  className={`font-semibold tabular-nums ${isDailyNormMet ? 'text-[var(--color-accent)]' : 'text-[var(--color-primary)]'}`}
                >
                  {formatPracticeCount(todayCount)} / {formatPracticeCount(dailyNorm)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Сегодня</p>
              </div>
              <div>
                <p className="font-semibold tabular-nums text-[var(--color-primary)]">
                  {formatPracticeCount(remaining)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">Осталось</p>
              </div>
            </div>
          </div>
        )}

        <VirtualMalaCounter
          countInRound={malaCountInRound}
          completedRounds={malaCompletedRounds}
          onTap={handleMalaTap}
        />

        <div className="card mt-4 p-4">
          <h3 className="mb-3 text-center font-medium text-[var(--color-primary)]">Быстрое добавление</h3>
          <div className="flex justify-center gap-3">
            {QUICK_ADD_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => void handleQuickAdd(amount)}
                className="btn-primary min-w-[72px] px-4 py-2.5 text-sm"
              >
                +{amount}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAddDialog(true)}
            className="btn-secondary mt-3 flex w-full items-center justify-center gap-2 px-4 py-2.5"
          >
            Добавить подход
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Выполнено', value: practice.completedCount },
            { label: 'Осталось', value: remaining },
            { label: 'Цель', value: practice.targetCount },
          ].map((stat) => (
            <div key={stat.label} className="card p-3 text-center">
              <p className="text-lg font-semibold tabular-nums text-[var(--color-primary)]">
                {formatPracticeCount(stat.value)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>

        <PracticeHistorySection groups={historyGroups} />
      </div>

      <AddSessionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onConfirm={(count, date, note) => void handleAddSession(count, date, note)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        message={DELETE_CONFIRM_MESSAGE}
        onConfirm={() => void handleDelete()}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}

