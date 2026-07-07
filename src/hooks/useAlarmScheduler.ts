import { useEffect, useState, useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { checkAlarms } from '../lib/alarmScheduler'
import {
  showSystemNotification,
  vibrateForAlarm,
  type ActiveAlarm,
} from '../lib/notifications'

export function useAlarmScheduler() {
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null)

  const processAlarms = useCallback(() => {
    const settings = useSettingsStore.getState()
    const due = checkAlarms(settings)
    for (const alarm of due) {
      vibrateForAlarm(alarm.kind)
      showSystemNotification(alarm)
      setActiveAlarm(alarm)
    }
  }, [])

  useEffect(() => {
    processAlarms()
    const interval = setInterval(processAlarms, 30_000)
    return () => clearInterval(interval)
  }, [processAlarms])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') processAlarms()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', processAlarms)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', processAlarms)
    }
  }, [processAlarms])

  const dismissAlarm = useCallback(() => setActiveAlarm(null), [])

  return { activeAlarm, dismissAlarm }
}
