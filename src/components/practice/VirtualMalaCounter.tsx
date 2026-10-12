import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'
import { formatPracticeCount } from '../../lib/format'

const MALA_BEAD_COUNT = 108
const SCROLL_GUARD_MS = 400
const TAP_MOVE_TOLERANCE_PX = 10

interface VirtualMalaCounterProps {
  countInRound: number
  completedRounds: number
  onTap: () => void
  seriesCount?: number
  onUndoSeries?: () => void
}

export function VirtualMalaCounter({
  countInRound,
  completedRounds,
  onTap,
  seriesCount = 0,
  onUndoSeries,
}: VirtualMalaCounterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTapRef = useRef(0)
  const lastScrollRef = useRef(0)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const pointerMovedRef = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      lastScrollRef.current = Date.now()
    }
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2
    const ringRadius = Math.min(w, h) * 0.38
    const beadRadius = Math.min(w, h) * 0.028

    const styles = getComputedStyle(document.documentElement)
    const beadColor = styles.getPropertyValue('--outline').trim() || '#85746A'
    const activeColor = styles.getPropertyValue('--color-accent').trim() || '#D4A853'
    const guruColor = styles.getPropertyValue('--color-primary').trim() || '#8B1A1A'

    ctx.clearRect(0, 0, w, h)

    for (let i = 0; i < MALA_BEAD_COUNT; i++) {
      const angle = (i / MALA_BEAD_COUNT) * 2 * Math.PI - Math.PI / 2
      const x = cx + ringRadius * Math.cos(angle)
      const y = cy + ringRadius * Math.sin(angle)

      const beadIndex = i + 1
      const isGuru = beadIndex === MALA_BEAD_COUNT
      const isActive = beadIndex <= countInRound
      const isCurrent = beadIndex === countInRound

      let r = beadRadius
      let color = beadColor

      if (isGuru) {
        color = guruColor
        r = beadRadius * 1.2
      } else if (isActive) {
        color = activeColor
      }

      if (isCurrent && countInRound > 0) {
        r = beadRadius * 1.35
      }

      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.globalAlpha = isActive || isGuru ? 1 : 0.45
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }, [countInRound])

  useEffect(() => {
    draw()
    const observer = new ResizeObserver(draw)
    if (canvasRef.current) observer.observe(canvasRef.current)
    return () => observer.disconnect()
  }, [draw])

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    pointerMovedRef.current = false
  }

  const handlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const start = pointerStartRef.current
    if (!start) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TAP_MOVE_TOLERANCE_PX) {
      pointerMovedRef.current = true
    }
  }

  const handleTap = () => {
    const now = Date.now()
    const moved = pointerMovedRef.current
    pointerStartRef.current = null
    pointerMovedRef.current = false
    if (moved) return
    if (now - lastScrollRef.current < SCROLL_GUARD_MS) return
    if (now - lastTapRef.current < 500) return
    lastTapRef.current = now
    onTap()
  }

  return (
    <div className="card p-4">
      <h3 className="text-center font-medium text-[var(--color-primary)]">Виртуальные чётки</h3>
      <p className="mb-3 text-center text-xs text-[var(--text-muted)]">
        Нажмите на круг для подсчёта повторений
      </p>

      <button
        type="button"
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        aria-label="Добавить одно повторение"
        className="relative mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center rounded-[20px] bg-[var(--surface)]/55 transition-transform active:scale-[0.98]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full p-4" />
        <div className="pointer-events-none relative z-10 text-center">
          <p className="text-4xl font-bold tabular-nums text-[var(--color-primary)]">
            {countInRound}
          </p>
          <p className="text-sm text-[var(--text-muted)]">из {MALA_BEAD_COUNT}</p>
          {completedRounds > 0 && (
            <p className="mt-1 text-sm font-medium text-[var(--color-accent)]">
              Кругов: {completedRounds}
            </p>
          )}
        </div>
      </button>

      {seriesCount > 0 && onUndoSeries && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
          <p className="text-sm text-[var(--text-muted)]">
            Записано с чёток:{' '}
            <span className="font-medium tabular-nums text-[var(--color-primary)]">
              {formatPracticeCount(seriesCount)}
            </span>
          </p>
          <button
            type="button"
            onClick={onUndoSeries}
            className="btn-secondary shrink-0 px-3 py-1.5 text-sm"
          >
            Отменить
          </button>
        </div>
      )}
    </div>
  )
}

