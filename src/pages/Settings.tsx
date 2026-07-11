import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Download, Upload, Bell, Moon } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { useSettingsStore, APP_VERSION } from '../store/settingsStore'
import { usePracticeStore } from '../store/practiceStore'
import { useTransmissionStore } from '../store/transmissionStore'
import { useDreamStore } from '../store/dreamStore'
import { usePracticeTextStore } from '../store/practiceTextStore'
import {
  DREAM_YOGA_SLOTS,
  DREAM_YOGA_SLOT_LABELS,
  alarmTimeToInputValue,
  getSlotTime,
  parseAlarmTimeInput,
} from '../lib/dreamYogaSchedule'
import { requestNotificationPermission } from '../lib/notifications'
import { unlockAlarmAudio } from '../lib/alarmSound'
import { saveTextFile } from '../lib/downloadTextFile'
import type { ThemeMode, PractitionerGender } from '../lib/types'

export function Settings() {
  const themeMode = useSettingsStore((s) => s.themeMode)
  const remindersEnabled = useSettingsStore((s) => s.remindersEnabled)
  const reminderHour = useSettingsStore((s) => s.reminderHour)
  const reminderMinute = useSettingsStore((s) => s.reminderMinute)
  const dreamYogaEnabled = useSettingsStore((s) => s.dreamYogaEnabled)
  const dreamYogaBedtimeSlotEnabled = useSettingsStore((s) => s.dreamYogaBedtimeSlotEnabled)
  const dreamYogaNight1SlotEnabled = useSettingsStore((s) => s.dreamYogaNight1SlotEnabled)
  const dreamYogaNight2SlotEnabled = useSettingsStore((s) => s.dreamYogaNight2SlotEnabled)
  const dreamYogaNight3SlotEnabled = useSettingsStore((s) => s.dreamYogaNight3SlotEnabled)
  const dreamYogaNight4SlotEnabled = useSettingsStore((s) => s.dreamYogaNight4SlotEnabled)
  const dreamYogaWakeSlotEnabled = useSettingsStore((s) => s.dreamYogaWakeSlotEnabled)
  const dreamYogaSlotTimes = useSettingsStore(
    useShallow((s) => ({
      dreamYogaBedtimeHour: s.dreamYogaBedtimeHour,
      dreamYogaBedtimeMinute: s.dreamYogaBedtimeMinute,
      dreamYogaNight1Hour: s.dreamYogaNight1Hour,
      dreamYogaNight1Minute: s.dreamYogaNight1Minute,
      dreamYogaNight2Hour: s.dreamYogaNight2Hour,
      dreamYogaNight2Minute: s.dreamYogaNight2Minute,
      dreamYogaNight3Hour: s.dreamYogaNight3Hour,
      dreamYogaNight3Minute: s.dreamYogaNight3Minute,
      dreamYogaNight4Hour: s.dreamYogaNight4Hour,
      dreamYogaNight4Minute: s.dreamYogaNight4Minute,
      dreamYogaWakeHour: s.dreamYogaWakeHour,
      dreamYogaWakeMinute: s.dreamYogaWakeMinute,
    })),
  )
  const practitionerGender = useSettingsStore((s) => s.practitionerGender)
  const setThemeMode = useSettingsStore((s) => s.setThemeMode)
  const setReminders = useSettingsStore((s) => s.setReminders)
  const setDreamYogaEnabled = useSettingsStore((s) => s.setDreamYogaEnabled)
  const setDreamYogaSlotTime = useSettingsStore((s) => s.setDreamYogaSlotTime)
  const setDreamYogaSlotEnabled = useSettingsStore((s) => s.setDreamYogaSlotEnabled)
  const setPractitionerGender = useSettingsStore((s) => s.setPractitionerGender)
  const exportData = useSettingsStore((s) => s.exportData)
  const importData = useSettingsStore((s) => s.importData)

  const loadPractices = usePracticeStore((s) => s.loadPractices)
  const loadTransmissions = useTransmissionStore((s) => s.loadTransmissions)
  const loadDreams = useDreamStore((s) => s.loadDreams)
  const loadTexts = usePracticeTextStore((s) => s.loadTexts)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const json = await exportData()
      const filename = `yungdrung_backup_${new Date().toISOString().slice(0, 10)}.json`
      await saveTextFile(filename, json)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      const message = error instanceof Error ? error.message : 'Не удалось экспортировать данные'
      alert(`Ошибка экспорта: ${message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('Импорт заменит все текущие данные. Продолжить?')) {
      e.target.value = ''
      return
    }
    try {
      const text = await file.text()
      await importData(text)
      await Promise.all([loadPractices(), loadTransmissions(), loadDreams(), loadTexts()])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка импорта')
    }
    e.target.value = ''
  }

  const handleEnableNotifications = () => {
    void requestNotificationPermission()
    void unlockAlarmAudio()
  }

  const handleRemindersToggle = (checked: boolean) => {
    setReminders(checked)
    if (checked) handleEnableNotifications()
  }

  const handleDreamYogaToggle = (checked: boolean) => {
    setDreamYogaEnabled(checked)
    if (checked) handleEnableNotifications()
  }

  const slotEnabled = {
    bedtime: dreamYogaBedtimeSlotEnabled,
    night_1: dreamYogaNight1SlotEnabled,
    night_2: dreamYogaNight2SlotEnabled,
    night_3: dreamYogaNight3SlotEnabled,
    night_4: dreamYogaNight4SlotEnabled,
    wake: dreamYogaWakeSlotEnabled,
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm'

  const timeInputClass =
    'rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm tabular-nums'

  return (
    <>
      <Header title="Настройки" />
      <div className="flex flex-col gap-4 p-4">
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

        <section className="card p-4">
          <h3 className="mb-3 font-medium">Пол практикующего</h3>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            Для визуализаций Ма Три и Ду Три Су
          </p>
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

        <section className="card p-4">
          <h3 className="mb-3 font-medium">Напоминания о практике</h3>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => handleRemindersToggle(e.target.checked)}
              className="h-5 w-5 cursor-pointer accent-[var(--color-primary)]"
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

        <section className="card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Moon className="h-5 w-5 text-[var(--color-primary)]" />
            <h3 className="font-medium">Йога сна</h3>
          </div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={dreamYogaEnabled}
              onChange={(e) => handleDreamYogaToggle(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-primary)]"
            />
            <div>
              <span className="text-sm font-medium">Ночные будильники</span>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Выберите, какие напоминания включить
              </p>
            </div>
          </label>

          {dreamYogaEnabled && (
            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Расписание:
              </p>

              {DREAM_YOGA_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className="flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3"
                >
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="text-sm font-medium">{DREAM_YOGA_SLOT_LABELS[slot]}</span>
                    <input
                      type="checkbox"
                      checked={slotEnabled[slot]}
                      onChange={(e) => setDreamYogaSlotEnabled(slot, e.target.checked)}
                      className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-primary)]"
                    />
                  </label>
                  <input
                    type="time"
                    value={alarmTimeToInputValue(getSlotTime(dreamYogaSlotTimes, slot))}
                    onChange={(e) => {
                      const parsed = parseAlarmTimeInput(e.target.value)
                      setDreamYogaSlotTime(slot, parsed.hour, parsed.minute)
                    }}
                    className={timeInputClass}
                  />
                </div>
              ))}

              <p className="text-xs text-[var(--text-muted)]">
                На iPhone звук работает, если PWA установлена на экран «Домой» и разрешены
                уведомления.
              </p>
            </div>
          )}
        </section>

        <section className="card p-4">
          <h3 className="mb-3 font-medium">Резервная копия</h3>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Экспорт…' : 'Экспорт (JSON)'}
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

        <p className="pb-4 text-center text-xs text-[var(--text-muted)]">
          Версия {APP_VERSION}
        </p>
      </div>
    </>
  )
}
