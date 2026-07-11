import { Moon, MoonStar, Sun } from 'lucide-react'
import { getMoonPhase, type MoonPhaseKind } from '../../lib/moonphase'

function MoonIcon({ kind }: { kind: MoonPhaseKind }) {
  if (kind === 'new_moon') {
    return <Moon className="h-7 w-7 text-[var(--color-silver)]" />
  }
  if (kind === 'waxing_crescent' || kind === 'first_quarter') {
    return <MoonStar className="h-7 w-7 text-[var(--color-silver)]" />
  }
  if (kind === 'waxing_gibbous' || kind === 'full_moon') {
    return <Sun className="h-7 w-7 text-[var(--color-silver)]" />
  }
  return <Moon className="h-7 w-7 text-[var(--color-silver)]" />
}

export function AstroCard() {
  const moon = getMoonPhase(new Date())

  return (
    <div className="card p-4">
      <div className="flex items-center justify-center gap-3">
        <MoonIcon kind={moon.kind} />
        <div>
          <p className="text-sm font-medium">{moon.phaseName}</p>
          <p className="text-xs text-[var(--text-muted)]">Возраст: {moon.ageDays} дн.</p>
        </div>
      </div>
    </div>
  )
}
