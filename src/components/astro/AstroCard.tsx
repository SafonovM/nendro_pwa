import { Sunrise, Sunset, Moon, MoonStar } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getMoonPhase } from '../../lib/moonphase'
import { getSunriseSunset, formatTime } from '../../lib/sunrise'
import { useSettingsStore } from '../../store/settingsStore'

function MoonIcon({ kind }: { kind: string }) {
  if (kind === 'full_moon' || kind === 'new_moon') {
    return <Moon className="h-5 w-5 text-[var(--color-accent)]" />
  }
  return <MoonStar className="h-5 w-5 text-[var(--color-accent)]" />
}

export function AstroCard() {
  const latitude = useSettingsStore((s) => s.latitude)
  const longitude = useSettingsStore((s) => s.longitude)
  const today = new Date()
  const moon = getMoonPhase(today)

  const sunTimes =
    latitude !== null && longitude !== null
      ? getSunriseSunset(today, latitude, longitude)
      : null

  if (latitude === null || longitude === null) {
    return (
      <div className="card p-4">
        <p className="text-sm text-[var(--text-muted)]">
          Укажите местоположение в настройках
        </p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {format(today, 'd MMMM yyyy', { locale: ru })}
      </p>

      {sunTimes && (
        <div className="mb-4 flex gap-6">
          <div className="flex items-center gap-2">
            <Sunrise className="h-5 w-5 text-[var(--color-accent)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Восход</p>
              <p className="font-medium">{formatTime(sunTimes.sunrise)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="h-5 w-5 text-[var(--color-accent)]" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Закат</p>
              <p className="font-medium">{formatTime(sunTimes.sunset)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-[var(--border)] pt-3">
        <MoonIcon kind={moon.kind} />
        <div>
          <p className="font-medium">{moon.phaseName}</p>
          <p className="text-sm text-[var(--text-muted)]">Возраст: {moon.ageDays} дн.</p>
        </div>
      </div>
    </div>
  )
}
