import { toJulianDate } from './julian'

const DEG = Math.PI / 180

function normalizeDegrees(angle: number): number {
  let a = angle % 360
  if (a < 0) a += 360
  return a
}

function toRadians(deg: number): number {
  return deg * DEG
}

function sinD(deg: number): number {
  return Math.sin(toRadians(deg))
}

function cosD(deg: number): number {
  return Math.cos(toRadians(deg))
}

/** Meeus algorithm for sunrise/sunset (Chapter 15). */
export function getSunriseSunset(
  date: Date,
  lat: number,
  lng: number,
): { sunrise: Date; sunset: Date } | null {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null

  const jd = toJulianDate(date)
  const n = jd - 2451545.0 + 0.0008
  const jStar = n - lng / 360

  const mDeg = normalizeDegrees(357.5291 + 0.98560028 * jStar)
  const c = 1.9148 * sinD(mDeg) + 0.02 * sinD(2 * mDeg) + 0.0003 * sinD(3 * mDeg)
  const lambda = normalizeDegrees(mDeg + 102.9372 + c + 180)
  const jTransit =
    2451545.0 + jStar + 0.0053 * sinD(mDeg) - 0.0069 * sinD(2 * lambda)

  const sinDec = sinD(lambda) * sinD(23.44)
  const cosDec = Math.cos(Math.asin(sinDec))

  const zenith = 90.833
  const cosH =
    (cosD(zenith) - sinD(lat) * sinDec) / (cosD(lat) * cosDec)

  if (cosH < -1 || cosH > 1) return null

  const h = Math.acos(cosH) / DEG
  const jRise = jTransit - h / 360
  const jSet = jTransit + h / 360

  const sunrise = julianToLocalDate(jRise, lng)
  const sunset = julianToLocalDate(jSet, lng)

  sunrise.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
  sunset.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())

  return { sunrise, sunset }
}

function julianToLocalDate(jd: number, lng: number): Date {
  const z = Math.floor(jd + 0.5)
  const f = jd + 0.5 - z
  let a = z
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }
  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const d = Math.floor(365.25 * c)
  const e = Math.floor((b - d) / 30.6001)

  const day = b - d - Math.floor(30.6001 * e) + f
  const month = e < 14 ? e - 1 : e - 13
  const year = month > 2 ? c - 4716 : c - 4715

  const totalHours = day * 24
  const hours = Math.floor(totalHours) % 24
  const minutes = Math.floor((totalHours - Math.floor(totalHours)) * 60)
  const seconds = Math.floor(((totalHours - Math.floor(totalHours)) * 60 - minutes) * 60)

  const tzOffsetHours = -lng / 15
  const utcMs = Date.UTC(year, month - 1, Math.floor(day), hours, minutes, seconds)
  return new Date(utcMs - tzOffsetHours * 3600 * 1000 + new Date().getTimezoneOffset() * 60 * 1000)
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
