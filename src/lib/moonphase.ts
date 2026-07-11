import { toJulianDate } from './julian'

const SYNODIC_MONTH = 29.530588853
const KNOWN_NEW_MOON_JD = 2451550.1

export type MoonPhaseKind =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

export interface MoonPhase {
  illumination: number
  ageDays: number
  phaseName: string
  kind: MoonPhaseKind
}

function phaseKind(phase: number): MoonPhaseKind {
  if (phase < 0.0625 || phase >= 0.9375) return 'new_moon'
  if (phase < 0.1875) return 'waxing_crescent'
  if (phase < 0.3125) return 'first_quarter'
  if (phase < 0.4375) return 'waxing_gibbous'
  if (phase < 0.5625) return 'full_moon'
  if (phase < 0.6875) return 'waning_gibbous'
  if (phase < 0.8125) return 'last_quarter'
  return 'waning_crescent'
}

const PHASE_NAMES: Record<MoonPhaseKind, string> = {
  new_moon: 'Новолуние',
  waxing_crescent: 'Растущий серп',
  first_quarter: 'Первая четверть',
  waxing_gibbous: 'Растущая Луна',
  full_moon: 'Полнолуние',
  waning_gibbous: 'Убывающая Луна',
  last_quarter: 'Последняя четверть',
  waning_crescent: 'Убывающий серп',
}

export function getMoonPhase(date: Date): MoonPhase {
  const jd = toJulianDate(date)
  const phase = (jd - KNOWN_NEW_MOON_JD) / SYNODIC_MONTH
  const normalizedPhase = phase - Math.floor(phase)
  const ageDays = Math.min(29, Math.floor(normalizedPhase * SYNODIC_MONTH))
  const kind = phaseKind(normalizedPhase)
  return {
    illumination: normalizedPhase,
    ageDays,
    phaseName: PHASE_NAMES[kind],
    kind,
  }
}
