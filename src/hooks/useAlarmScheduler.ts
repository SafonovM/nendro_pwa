import { useEffect, useState, useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { checkAlarms } from '../lib/alarmScheduler'
import {
  alarmFromNotificationData,
  showSystemNotification,
  startAlarmFeedback,
  stopAlarmFeedback,
  type ActiveAlarm,
} from '../lib/notifications'
import { clearPendingAlarm, loadPendingAlarm, savePendingAlarm } from '../lib/pendingAlarm'

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
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(() => {
    return loadPendingAlarm() ?? alarmFromLaunchUrl()
  })

  const activateAlarm = useCallback((alarm: ActiveAlarm) => {
    savePendingAlarm(alarm)
    setActiveAlarm(alarm)
    if (document.visibilityState === 'visible') {
      startAlarmFeedback(alarm.kind)
    }
    void showSystemNotification(alarm)
  }, [])

  const dismissAlarm = useCallback(() => {
    stopAlarmFeedback()
    clearPendingAlarm()
    setActiveAlarm(null)
  }, [])

  const processAlarms = useCallback(() => {
    const settings = useSettingsStore.getState()
    const due = checkAlarms(settings)
    if (due.length > 0) {
      activateAlarm(due[due.length - 1]!)
    }
  }, [activateAlarm])

  useEffect(() => {
    const launchAlarm = alarmFromLaunchUrl()
    if (launchAlarm) {
      activateAlarm(launchAlarm)
      clearLaunchAlarmParams()
      return
    }
    const pending = loadPendingAlarm()
    if (pending) {
      startAlarmFeedback(pending.kind)
    }
  }, [activateAlarm])

  useEffect(() => {
    processAlarms()
    const interval = setInterval(processAlarms, 30_000)
    return () => clearInterval(interval)
  }, [processAlarms])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        processAlarms()
        const pending = loadPendingAlarm()
        if (pending) startAlarmFeedback(pending.kind)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', processAlarms)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', processAlarms)
    }
  }, [processAlarms])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'ALARM_NOTIFICATION_CLICK') return
      const alarm = alarmFromNotificationData(event.data.alarm)
      if (alarm) activateAlarm(alarm)
    }

    navigator.serviceWorker?.addEventListener('message', onMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [activateAlarm])

  return { activeAlarm, dismissAlarm }
}
