import type { AppSettings } from '../store/settingsStore'
import { useSettingsStore } from '../store/settingsStore'
import {
  buildAlarmTriggers,
  getDueAlarms,
  getFiredToday,
  markAlarmFired,
  msUntilTriggerToday,
} from './alarmScheduler'
import { buildAlarmScheduleEntries } from './buildAlarmScheduleEntries'
import {
  markAlarmEntryFired,
  replaceAlarmSchedule,
  syncTodayFiredFromStore,
} from './alarmStore'
import { format } from 'date-fns'
import type { ActiveAlarm } from './notifications'

export type ActivateAlarmFn = (alarm: ActiveAlarm, triggerId: string) => void

let timeoutIds: ReturnType<typeof setTimeout>[] = []
let pollInterval: ReturnType<typeof setInterval> | null = null
let activeActivate: ActivateAlarmFn | null = null

function clearTimeouts() {
  for (const id of timeoutIds) clearTimeout(id)
  timeoutIds = []
}

function getPollIntervalMs() {
  return document.visibilityState === 'visible' ? 2000 : 15000
}

function startPolling() {
  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(() => {
    if (!activeActivate) return
    fireDueAlarms(useSettingsStore.getState(), activeActivate)
  }, getPollIntervalMs())
}

function fireDueAlarms(settings: AppSettings, activate: ActivateAlarmFn) {
  for (const item of getDueAlarms(settings)) {
    activate(item.alarm, item.id)
  }
}

function scheduleTimeouts(settings: AppSettings, activate: ActivateAlarmFn) {
  const now = new Date()
  const fired = getFiredToday()

  for (const trigger of buildAlarmTriggers(settings)) {
    if (fired[trigger.id]) continue
    const ms = msUntilTriggerToday(trigger.hour, trigger.minute, now)
    if (ms == null) continue

    timeoutIds.push(
      setTimeout(() => {
        activate(trigger.alarm, trigger.id)
      }, ms),
    )
  }
}

export function refreshPollInterval() {
  if (!activeActivate) return
  startPolling()
}

export function runAlarmSchedule(settings: AppSettings, activate: ActivateAlarmFn) {
  activeActivate = activate
  clearTimeouts()
  fireDueAlarms(settings, activate)
  scheduleTimeouts(settings, activate)
  startPolling()
}

export function stopAlarmScheduleRunner() {
  clearTimeouts()
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  activeActivate = null
}

export async function markAlarmFiredEverywhere(triggerId: string): Promise<void> {
  markAlarmFired(triggerId)
  const today = format(new Date(), 'yyyy-MM-dd')
  await markAlarmEntryFired(`${triggerId}:${today}`)
}

export async function persistAlarmSchedule(settings: AppSettings): Promise<void> {
  const entries = buildAlarmScheduleEntries(settings)
  await replaceAlarmSchedule(entries)
}

async function registerBackgroundAlarmChecks(registration: ServiceWorkerRegistration) {
  try {
    if ('sync' in registration) {
      await (
        registration as ServiceWorkerRegistration & {
          sync: { register: (tag: string) => Promise<void> }
        }
      ).sync.register('alarm-check')
    }
  } catch {
    // Background Sync may be unavailable or denied
  }

  try {
    if ('periodicSync' in registration) {
      await (
        registration as ServiceWorkerRegistration & {
          periodicSync: {
            register: (tag: string, options: { minInterval: number }) => Promise<void>
          }
        }
      ).periodicSync.register('alarm-check', { minInterval: 60 * 60 * 1000 })
    }
  } catch {
    // Periodic Background Sync requires installed PWA + permission
  }
}

export async function syncAlarmScheduleToServiceWorker(settings: AppSettings): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  await persistAlarmSchedule(settings)

  const registration = await navigator.serviceWorker.ready
  registration.active?.postMessage({ type: 'CHECK_ALARMS' })
  await registerBackgroundAlarmChecks(registration)
}

export async function hydrateFiredAlarmsFromStore(): Promise<void> {
  await syncTodayFiredFromStore(markAlarmFired)
}

export async function persistScheduleOnBackground(settings: AppSettings): Promise<void> {
  await syncAlarmScheduleToServiceWorker(settings)
}
