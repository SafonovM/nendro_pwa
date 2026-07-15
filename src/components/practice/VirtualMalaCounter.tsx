import { useCallback, useEffect, useRef } from 'react'

const MALA_BEAD_COUNT = 108

interface VirtualMalaCounterProps {
  countInRound: number
  completedRounds: number
  onTap: () => void
}

export function VirtualMalaCounter({ countInRound, completedRounds, onTap }: VirtualMalaCounterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTapRef = useRef(0)

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

  const handleTap = () => {
    const now = Date.now()
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
    </div>
  )
}

