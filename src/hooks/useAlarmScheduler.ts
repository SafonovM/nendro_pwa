import { useEffect, useState, useCallback, useRef } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { getFiredToday } from '../lib/alarmScheduler'
import {
  runAlarmSchedule,
  stopAlarmScheduleRunner,
  refreshPollInterval,
  syncAlarmScheduleToServiceWorker,
  markAlarmFiredEverywhere,
  hydrateFiredAlarmsFromStore,
  persistScheduleOnBackground,
} from '../lib/alarmScheduleRunner'
import {
  alarmFromNotificationData,
  showSystemNotification,
  startAlarmFeedback,
  stopAlarmFeedback,
  type ActiveAlarm,
} from '../lib/notifications'
import { clearPendingAlarm, loadPendingAlarm, savePendingAlarm } from '../lib/pendingAlarm'

function triggerIdForAlarm(alarm: ActiveAlarm): string | undefined {
  if (alarm.kind === 'practice') return 'practice-reminder'
  if (alarm.slot) return `dream-yoga-${alarm.slot}`
  return undefined
}

function alarmFromLaunchUrl(): ActiveAlarm | null {
  const params = new URLSearchParams(window.location.search)
  const kind = params.get('alarm')
  if (!kind) return null
  return alarmFromNotificationData({
    kind,
    slot: params.get('slot') ?? undefined,
  })
}

function clearLaunchAlarmParams() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('alarm')) return
  url.searchParams.delete('alarm')
  url.searchParams.delete('slot')
  window.history.replaceState({}, '', url.pathname + url.search + url.hash)
}

export function useAlarmScheduler() {
  const [settingsReady, setSettingsReady] = useState(() => useSettingsStore.persist.hasHydrated())
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(() => {
    return loadPendingAlarm() ?? alarmFromLaunchUrl()
  })
  const scheduleRef = useRef<(() => void) | null>(null)

  const activateAlarm = useCallback((alarm: ActiveAlarm, triggerId?: string) => {
    const resolvedId = triggerId ?? triggerIdForAlarm(alarm)
    if (resolvedId && getFiredToday()[resolvedId]) return

    if (resolvedId) {
      void markAlarmFiredEverywhere(resolvedId)
    }

    savePendingAlarm(alarm)
    setActiveAlarm(alarm)

    if (document.visibilityState === 'visible') {
      startAlarmFeedback(alarm.kind)
      void showSystemNotification(alarm)
    }

    scheduleRef.current?.()
  }, [])

  const dismissAlarm = useCallback(() => {
    stopAlarmFeedback()
    clearPendingAlarm()
    setActiveAlarm(null)
  }, [])

  const reschedule = useCallback(() => {
    const settings = useSettingsStore.getState()
    runAlarmSchedule(settings, activateAlarm)
    void syncAlarmScheduleToServiceWorker(settings)
  }, [activateAlarm])

  scheduleRef.current = reschedule

  useEffect(() => {
    if (useSettingsStore.persist.hasHydrated()) {
      setSettingsReady(true)
      return
    }
    return useSettingsStore.persist.onFinishHydration(() => setSettingsReady(true))
  }, [])

  useEffect(() => {
    if (!settingsReady) return

    void hydrateFiredAlarmsFromStore().then(() => {
      const launchAlarm = alarmFromLaunchUrl()
      if (launchAlarm) {
        activateAlarm(launchAlarm)
        clearLaunchAlarmParams()
      } else {
        const pending = loadPendingAlarm()
        if (pending) {
          startAlarmFeedback(pending.kind)
        }
      }

      reschedule()
    })

    return () => stopAlarmScheduleRunner()
  }, [settingsReady, reschedule, activateAlarm])

  useEffect(() => {
    if (!settingsReady) return
    return useSettingsStore.subscribe(() => {
      reschedule()
    })
  }, [settingsReady, reschedule])

  useEffect(() => {
    if (!settingsReady) return

    const onVisible = () => {
      refreshPollInterval()
      if (document.visibilityState === 'visible') {
        reschedule()
        const pending = loadPendingAlarm()
        if (pending) startAlarmFeedback(pending.kind)
        return
      }

      const settings = useSettingsStore.getState()
      void persistScheduleOnBackground(settings)
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    window.addEventListener('pagehide', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.removeEventListener('pagehide', onVisible)
    }
  }, [settingsReady, reschedule])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ALARM_NOTIFICATION_CLICK') {
        const alarm = alarmFromNotificationData(event.data.alarm)
        if (alarm) activateAlarm(alarm)
        return
      }
      if (event.data?.type === 'ALARM_FIRED') {
        const alarm = alarmFromNotificationData(event.data.alarm)
        if (alarm) activateAlarm(alarm, event.data.triggerId as string | undefined)
      }
    }

    navigator.serviceWorker?.addEventListener('message', onMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [activateAlarm])

  return { activeAlarm, dismissAlarm }
}
