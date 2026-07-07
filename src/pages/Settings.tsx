import { useRef } from 'react'
import { MapPin, Download, Upload, Trash2, Bell } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useSettingsStore, APP_VERSION } from '../store/settingsStore'
import { useGeolocation } from '../hooks/useGeolocation'
import { usePracticeStore } from '../store/practiceStore'
import { useTransmissionStore } from '../store/transmissionStore'
import { useDreamStore } from '../store/dreamStore'
import type { ThemeMode, PractitionerGender } from '../lib/types'

export function Settings() {
  const {
    themeMode,
    latitude,
    longitude,
    remindersEnabled,
    reminderHour,
    reminderMinute,
    practitionerGender,
    setThemeMode,
    setCoordinates,
    setReminders,
    setPractitionerGender,
    exportData,
    importData,
    resetAllData,
  } = useSettingsStore()

  const { getCurrentPosition, loading: geoLoading, isSupported } = useGeolocation()
  const loadPractices = usePracticeStore((s) => s.loadPractices)
  const loadTransmissions = useTransmissionStore((s) => s.loadTransmissions)
  const loadDreams = useDreamStore((s) => s.loadDreams)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDetectLocation = async () => {
    try {
      const pos = await getCurrentPosition()
      setCoordinates(pos.coords.latitude, pos.coords.longitude)
    } catch {
      // error shown via hook
    }
  }

  const handleExport = async () => {
    const json = await exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yungdrung-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importData(text)
    await Promise.all([loadPractices(), loadTransmissions(), loadDreams()])
    e.target.value = ''
  }

  const handleReset = async () => {
    if (confirm('Удалить все данные? Это действие необратимо.')) {
      await resetAllData()
      await Promise.all([loadPractices(), loadTransmissions(), loadDreams()])
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission()
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm'

  return (
    <>
      <Header title="Настройки" />
      <div className="flex flex-col gap-4 p-4">
        {/* Theme */}
        <section className="card p-4">
          <h3 className="mb-3 font-medium">Тема</h3>
          <div className="flex gap-2">
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setThemeMode(mode)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  themeMode === mode
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg)] text-[var(--text)]'
                }`}
              >
                {mode === 'system' ? 'Системная' : mode === 'light' ? 'Светлая' : 'Тёмная'}
              </button>
            ))}
          </div>
        </section>

        {/* Gender */}
        <section className="card p-4">
          <h3 className="mb-3 font-medium">Пол практикующего</h3>
          <div className="flex gap-2">
            {(['male', 'female'] as PractitionerGender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setPractitionerGender(g)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  practitionerGender === g
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--bg)] text-[var(--text)]'
                }`}
              >
                {g === 'male' ? 'Мужской' : 'Женский'}
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="card p-4">
          <h3 className="mb-3 font-medium">Местоположение</h3>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Широта</label>
              <input
                type="number"
                step="0.0001"
                value={latitude ?? ''}
                onChange={(e) =>
                  setCoordinates(Number(e.target.value), longitude ?? 0)
                }
                className={inputClass}
                placeholder="55.7558"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Долгота</label>
              <input
                type="number"
                step="0.0001"
                value={longitude ?? ''}
                onChange={(e) =>
                  setCoordinates(latitude ?? 0, Number(e.target.value))
                }
                className={inputClass}
                placeholder="37.6173"
              />
            </div>
          </div>
          {isSupported && (
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={geoLoading}
              className="btn-secondary flex w-full items-center justify-center gap-2 px-4 py-2.5"
            >
              <MapPin className="h-4 w-4" />
              {geoLoading ? 'Определение...' : 'Определить'}
            </button>
          )}
        </section>

        {/* Reminders */}
        <section className="card p-4">
          <h3 className="mb-3 font-medium">Напоминания о практике</h3>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => {
                setReminders(e.target.checked)
                if (e.target.checked) requestNotificationPermission()
              }}
              className="h-5 w-5 accent-[var(--color-primary)]"
            />
            <span className="text-sm">Ежедневное напоминание</span>
          </label>
          {remindersEnabled && (
            <div className="mt-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="time"
                value={`${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number)
                  setReminders(true, h, m)
                }}
                className={inputClass}
              />
            </div>
          )}
        </section>

        {/* Export/Import */}
        <section className="card p-4">
          <h3 className="mb-3 font-medium">Резервная копия</h3>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5"
            >
              <Download className="h-4 w-4" />
              Экспорт (JSON)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5"
            >
              <Upload className="h-4 w-4" />
              Импорт (JSON)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </section>

        {/* Reset */}
        <section className="card p-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Сбросить все данные
          </button>
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Версия {APP_VERSION}
          </p>
        </section>
      </div>
    </>
  )
}
