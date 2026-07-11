import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { exportBackup, importBackup } from '../lib/backup'
import {
  calculateNightAlarmTimes,
  defaultDreamYogaSlotTimes,
  setSlotTime,
  type DreamYogaSlot,
} from '../lib/dreamYogaSchedule'
import type { PractitionerGender, ThemeMode } from '../lib/types'

export interface AppSettings {
  themeMode: ThemeMode
  remindersEnabled: boolean
  reminderHour: number
  reminderMinute: number
  dreamYogaEnabled: boolean
  dreamYogaBedtimeHour: number
  dreamYogaBedtimeMinute: number
  dreamYogaNight1Hour: number
  dreamYogaNight1Minute: number
  dreamYogaNight2Hour: number
  dreamYogaNight2Minute: number
  dreamYogaNight3Hour: number
  dreamYogaNight3Minute: number
  dreamYogaNight4Hour: number
  dreamYogaNight4Minute: number
  dreamYogaWakeHour: number
  dreamYogaWakeMinute: number
  dreamYogaBedtimeSlotEnabled: boolean
  dreamYogaNight1SlotEnabled: boolean
  dreamYogaNight2SlotEnabled: boolean
  dreamYogaNight3SlotEnabled: boolean
  dreamYogaNight4SlotEnabled: boolean
  dreamYogaWakeSlotEnabled: boolean
  dreamYogaSlotsInitialized: boolean
  practitionerGender: PractitionerGender
  splashShown: boolean
}

interface SettingsState extends AppSettings {
  setThemeMode: (mode: ThemeMode) => void
  setReminders: (enabled: boolean, hour?: number, minute?: number) => void
  setDreamYogaEnabled: (enabled: boolean) => void
  setDreamYogaSlotTime: (slot: DreamYogaSlot, hour: number, minute: number) => void
  setDreamYogaSlotEnabled: (slot: DreamYogaSlot, enabled: boolean) => void
  setPractitionerGender: (gender: PractitionerGender) => void
  markSplashShown: () => void
  exportData: () => Promise<string>
  importData: (json: string) => Promise<void>
  resetAllData: () => Promise<void>
}

const slotTimeDefaults = defaultDreamYogaSlotTimes()

const defaultSettings: AppSettings = {
  themeMode: 'system',
  remindersEnabled: false,
  reminderHour: 7,
  reminderMinute: 0,
  dreamYogaEnabled: false,
  ...slotTimeDefaults,
  dreamYogaBedtimeSlotEnabled: false,
  dreamYogaNight1SlotEnabled: false,
  dreamYogaNight2SlotEnabled: false,
  dreamYogaNight3SlotEnabled: false,
  dreamYogaNight4SlotEnabled: false,
  dreamYogaWakeSlotEnabled: false,
  dreamYogaSlotsInitialized: false,
  practitionerGender: 'male',
  splashShown: false,
}

function toBool(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return fallback
}

function normalizeAlarmComponent(value: unknown, max: number): number {
  const n = Math.floor(Number(value) || 0)
  return ((n % max) + max) % max
}

function normalizeSettings(raw: Partial<AppSettings> | undefined): AppSettings {
  const state = raw ?? {}
  const merged = {
    ...defaultSettings,
    ...state,
    themeMode: state.themeMode ?? defaultSettings.themeMode,
    remindersEnabled: toBool(state.remindersEnabled, defaultSettings.remindersEnabled),
    reminderHour: normalizeAlarmComponent(state.reminderHour ?? defaultSettings.reminderHour, 24),
    reminderMinute: normalizeAlarmComponent(
      state.reminderMinute ?? defaultSettings.reminderMinute,
      60,
    ),
    dreamYogaEnabled: toBool(state.dreamYogaEnabled, defaultSettings.dreamYogaEnabled),
    dreamYogaBedtimeHour: normalizeAlarmComponent(
      state.dreamYogaBedtimeHour ?? defaultSettings.dreamYogaBedtimeHour,
      24,
    ),
    dreamYogaBedtimeMinute: normalizeAlarmComponent(
      state.dreamYogaBedtimeMinute ?? defaultSettings.dreamYogaBedtimeMinute,
      60,
    ),
    dreamYogaNight1Hour: normalizeAlarmComponent(
      state.dreamYogaNight1Hour ?? defaultSettings.dreamYogaNight1Hour,
      24,
    ),
    dreamYogaNight1Minute: normalizeAlarmComponent(
      state.dreamYogaNight1Minute ?? defaultSettings.dreamYogaNight1Minute,
      60,
    ),
    dreamYogaNight2Hour: normalizeAlarmComponent(
      state.dreamYogaNight2Hour ?? defaultSettings.dreamYogaNight2Hour,
      24,
    ),
    dreamYogaNight2Minute: normalizeAlarmComponent(
      state.dreamYogaNight2Minute ?? defaultSettings.dreamYogaNight2Minute,
      60,
    ),
    dreamYogaNight3Hour: normalizeAlarmComponent(
      state.dreamYogaNight3Hour ?? defaultSettings.dreamYogaNight3Hour,
      24,
    ),
    dreamYogaNight3Minute: normalizeAlarmComponent(
      state.dreamYogaNight3Minute ?? defaultSettings.dreamYogaNight3Minute,
      60,
    ),
    dreamYogaNight4Hour: normalizeAlarmComponent(
      state.dreamYogaNight4Hour ?? defaultSettings.dreamYogaNight4Hour,
      24,
    ),
    dreamYogaNight4Minute: normalizeAlarmComponent(
      state.dreamYogaNight4Minute ?? defaultSettings.dreamYogaNight4Minute,
      60,
    ),
    dreamYogaWakeHour: normalizeAlarmComponent(
      state.dreamYogaWakeHour ?? defaultSettings.dreamYogaWakeHour,
      24,
    ),
    dreamYogaWakeMinute: normalizeAlarmComponent(
      state.dreamYogaWakeMinute ?? defaultSettings.dreamYogaWakeMinute,
      60,
    ),
    dreamYogaBedtimeSlotEnabled: toBool(
      state.dreamYogaBedtimeSlotEnabled,
      defaultSettings.dreamYogaBedtimeSlotEnabled,
    ),
    dreamYogaNight1SlotEnabled: toBool(
      state.dreamYogaNight1SlotEnabled,
      defaultSettings.dreamYogaNight1SlotEnabled,
    ),
    dreamYogaNight2SlotEnabled: toBool(
      state.dreamYogaNight2SlotEnabled,
      defaultSettings.dreamYogaNight2SlotEnabled,
    ),
    dreamYogaNight3SlotEnabled: toBool(
      state.dreamYogaNight3SlotEnabled,
      defaultSettings.dreamYogaNight3SlotEnabled,
    ),
    dreamYogaNight4SlotEnabled: toBool(
      state.dreamYogaNight4SlotEnabled,
      defaultSettings.dreamYogaNight4SlotEnabled,
    ),
    dreamYogaWakeSlotEnabled: toBool(
      state.dreamYogaWakeSlotEnabled,
      defaultSettings.dreamYogaWakeSlotEnabled,
    ),
    dreamYogaSlotsInitialized: toBool(
      state.dreamYogaSlotsInitialized,
      defaultSettings.dreamYogaSlotsInitialized,
    ),
    practitionerGender: state.practitionerGender ?? defaultSettings.practitionerGender,
    splashShown: toBool(state.splashShown, defaultSettings.splashShown),
  }
  return ensureDreamYogaSlotTimes(merged)
}

function applyDefaultDreamYogaSlots(): Partial<AppSettings> {
  return {
    ...defaultDreamYogaSlotTimes(),
    dreamYogaBedtimeSlotEnabled: false,
    dreamYogaNight1SlotEnabled: true,
    dreamYogaNight2SlotEnabled: true,
    dreamYogaNight3SlotEnabled: true,
    dreamYogaNight4SlotEnabled: true,
    dreamYogaWakeSlotEnabled: false,
    dreamYogaSlotsInitialized: true,
  }
}

function ensureDreamYogaSlotTimes(settings: AppSettings): AppSettings {
  const hasNightTimes =
    Number.isFinite(settings.dreamYogaNight1Hour) &&
    Number.isFinite(settings.dreamYogaNight1Minute)

  if (hasNightTimes) {
    return settings
  }

  const nights = calculateNightAlarmTimes(
    settings.dreamYogaBedtimeHour,
    settings.dreamYogaBedtimeMinute,
    settings.dreamYogaWakeHour,
    settings.dreamYogaWakeMinute,
  )

  return {
    ...settings,
    dreamYogaNight1Hour: nights[0]?.hour ?? 1,
    dreamYogaNight1Minute: nights[0]?.minute ?? 0,
    dreamYogaNight2Hour: nights[1]?.hour ?? 3,
    dreamYogaNight2Minute: nights[1]?.minute ?? 0,
    dreamYogaNight3Hour: nights[2]?.hour ?? 5,
    dreamYogaNight3Minute: nights[2]?.minute ?? 0,
    dreamYogaNight4Hour: nights[3]?.hour ?? 7,
    dreamYogaNight4Minute: nights[3]?.minute ?? 0,
  }
}

function dreamYogaSettingsChanged(before: AppSettings, after: AppSettings): boolean {
  return (
    before.dreamYogaBedtimeHour !== after.dreamYogaBedtimeHour ||
    before.dreamYogaBedtimeMinute !== after.dreamYogaBedtimeMinute ||
    before.dreamYogaNight1Hour !== after.dreamYogaNight1Hour ||
    before.dreamYogaNight1Minute !== after.dreamYogaNight1Minute ||
    before.dreamYogaNight2Hour !== after.dreamYogaNight2Hour ||
    before.dreamYogaNight2Minute !== after.dreamYogaNight2Minute ||
    before.dreamYogaNight3Hour !== after.dreamYogaNight3Hour ||
    before.dreamYogaNight3Minute !== after.dreamYogaNight3Minute ||
    before.dreamYogaNight4Hour !== after.dreamYogaNight4Hour ||
    before.dreamYogaNight4Minute !== after.dreamYogaNight4Minute ||
    before.dreamYogaWakeHour !== after.dreamYogaWakeHour ||
    before.dreamYogaWakeMinute !== after.dreamYogaWakeMinute ||
    before.dreamYogaBedtimeSlotEnabled !== after.dreamYogaBedtimeSlotEnabled ||
    before.dreamYogaNight1SlotEnabled !== after.dreamYogaNight1SlotEnabled ||
    before.dreamYogaNight2SlotEnabled !== after.dreamYogaNight2SlotEnabled ||
    before.dreamYogaNight3SlotEnabled !== after.dreamYogaNight3SlotEnabled ||
    before.dreamYogaNight4SlotEnabled !== after.dreamYogaNight4SlotEnabled ||
    before.dreamYogaWakeSlotEnabled !== after.dreamYogaWakeSlotEnabled ||
    before.dreamYogaSlotsInitialized !== after.dreamYogaSlotsInitialized
  )
}

function ensureDreamYogaNightDefaults(settings: AppSettings): AppSettings {
  const withTimes = ensureDreamYogaSlotTimes(settings)
  if (!withTimes.dreamYogaEnabled || withTimes.dreamYogaSlotsInitialized) {
    return withTimes
  }

  return { ...withTimes, ...applyDefaultDreamYogaSlots() }
}

function pickSettings(state: SettingsState): AppSettings {
  return {
    themeMode: state.themeMode,
    remindersEnabled: state.remindersEnabled,
    reminderHour: state.reminderHour,
    reminderMinute: state.reminderMinute,
    dreamYogaEnabled: state.dreamYogaEnabled,
    dreamYogaBedtimeHour: state.dreamYogaBedtimeHour,
    dreamYogaBedtimeMinute: state.dreamYogaBedtimeMinute,
    dreamYogaNight1Hour: state.dreamYogaNight1Hour,
    dreamYogaNight1Minute: state.dreamYogaNight1Minute,
    dreamYogaNight2Hour: state.dreamYogaNight2Hour,
    dreamYogaNight2Minute: state.dreamYogaNight2Minute,
    dreamYogaNight3Hour: state.dreamYogaNight3Hour,
    dreamYogaNight3Minute: state.dreamYogaNight3Minute,
    dreamYogaNight4Hour: state.dreamYogaNight4Hour,
    dreamYogaNight4Minute: state.dreamYogaNight4Minute,
    dreamYogaWakeHour: state.dreamYogaWakeHour,
    dreamYogaWakeMinute: state.dreamYogaWakeMinute,
    dreamYogaBedtimeSlotEnabled: state.dreamYogaBedtimeSlotEnabled,
    dreamYogaNight1SlotEnabled: state.dreamYogaNight1SlotEnabled,
    dreamYogaNight2SlotEnabled: state.dreamYogaNight2SlotEnabled,
    dreamYogaNight3SlotEnabled: state.dreamYogaNight3SlotEnabled,
    dreamYogaNight4SlotEnabled: state.dreamYogaNight4SlotEnabled,
    dreamYogaWakeSlotEnabled: state.dreamYogaWakeSlotEnabled,
    dreamYogaSlotsInitialized: state.dreamYogaSlotsInitialized,
    practitionerGender: state.practitionerGender,
    splashShown: state.splashShown,
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setReminders: (enabled, hour, minute) =>
        set({
          remindersEnabled: enabled,
          ...(hour !== undefined ? { reminderHour: hour } : {}),
          ...(minute !== undefined ? { reminderMinute: minute } : {}),
        }),

      setDreamYogaEnabled: (enabled) => {
        if (enabled && !get().dreamYogaSlotsInitialized) {
          set({ dreamYogaEnabled: true, ...applyDefaultDreamYogaSlots() })
        } else {
          set({ dreamYogaEnabled: enabled })
        }
      },

      setDreamYogaSlotTime: (slot, hour, minute) => {
        const next = setSlotTime(get(), slot, hour, minute)
        set({
          dreamYogaBedtimeHour: next.dreamYogaBedtimeHour,
          dreamYogaBedtimeMinute: next.dreamYogaBedtimeMinute,
          dreamYogaNight1Hour: next.dreamYogaNight1Hour,
          dreamYogaNight1Minute: next.dreamYogaNight1Minute,
          dreamYogaNight2Hour: next.dreamYogaNight2Hour,
          dreamYogaNight2Minute: next.dreamYogaNight2Minute,
          dreamYogaNight3Hour: next.dreamYogaNight3Hour,
          dreamYogaNight3Minute: next.dreamYogaNight3Minute,
          dreamYogaNight4Hour: next.dreamYogaNight4Hour,
          dreamYogaNight4Minute: next.dreamYogaNight4Minute,
          dreamYogaWakeHour: next.dreamYogaWakeHour,
          dreamYogaWakeMinute: next.dreamYogaWakeMinute,
        })
      },

      setDreamYogaSlotEnabled: (slot, enabled) => {
        const key = {
          bedtime: 'dreamYogaBedtimeSlotEnabled',
          night_1: 'dreamYogaNight1SlotEnabled',
          night_2: 'dreamYogaNight2SlotEnabled',
          night_3: 'dreamYogaNight3SlotEnabled',
          night_4: 'dreamYogaNight4SlotEnabled',
          wake: 'dreamYogaWakeSlotEnabled',
        }[slot] as keyof AppSettings
        set({ [key]: enabled } as Partial<AppSettings>)
      },

      setPractitionerGender: (gender) => set({ practitionerGender: gender }),

      markSplashShown: () => set({ splashShown: true }),

      exportData: async () => exportBackup(pickSettings(get())),

      importData: async (json) => {
        const settings = await importBackup(json)
        if (settings) {
          set(normalizeSettings(settings))
        }
      },

      resetAllData: async () => {
        const { db } = await import('../lib/db')
        await db.practices.clear()
        await db.practiceSessions.clear()
        await db.transmissions.clear()
        await db.dreams.clear()
        await db.practiceTexts.clear()
        await db.practiceTextFiles.clear()
        await db.practiceMedia.clear()
      },
    }),
    {
      name: 'yungdrung-settings',
      version: 4,
      migrate: (persisted, version) => {
        const normalized = normalizeSettings(persisted as Partial<AppSettings>)
        if (version < 3) {
          return ensureDreamYogaNightDefaults(normalized)
        }
        if (version < 4) {
          return ensureDreamYogaNightDefaults(ensureDreamYogaSlotTimes(normalized))
        }
        return normalized
      },
      merge: (persisted, current) => {
        const merged = ensureDreamYogaNightDefaults({
          ...current,
          ...normalizeSettings(persisted as Partial<AppSettings>),
        })
        return { ...current, ...merged }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const before = pickSettings(state)
        const fixed = ensureDreamYogaNightDefaults(before)
        if (dreamYogaSettingsChanged(before, fixed)) {
          useSettingsStore.setState(fixed)
        }
      },
      partialize: (state) => pickSettings(state),
    },
  ),
)

export const APP_VERSION = '1.0.0'
