import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { exportBackup, importBackup } from '../lib/backup'
import type { PractitionerGender, ThemeMode } from '../lib/types'
import type { DreamYogaSlot } from '../lib/dreamYogaSchedule'

export interface AppSettings {
  themeMode: ThemeMode
  remindersEnabled: boolean
  reminderHour: number
  reminderMinute: number
  dreamYogaEnabled: boolean
  dreamYogaBedtimeHour: number
  dreamYogaBedtimeMinute: number
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
  setDreamYogaTimes: (bedtime: { h: number; m: number }, wake: { h: number; m: number }) => void
  setDreamYogaBedtime: (hour: number, minute: number) => void
  setDreamYogaWake: (hour: number, minute: number) => void
  setDreamYogaSlotEnabled: (slot: DreamYogaSlot, enabled: boolean) => void
  setPractitionerGender: (gender: PractitionerGender) => void
  markSplashShown: () => void
  exportData: () => Promise<string>
  importData: (json: string) => Promise<void>
  resetAllData: () => Promise<void>
}

const defaultSettings: AppSettings = {
  themeMode: 'system',
  remindersEnabled: false,
  reminderHour: 7,
  reminderMinute: 0,
  dreamYogaEnabled: false,
  dreamYogaBedtimeHour: 23,
  dreamYogaBedtimeMinute: 0,
  dreamYogaWakeHour: 7,
  dreamYogaWakeMinute: 0,
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

function normalizeSettings(raw: Partial<AppSettings> | undefined): AppSettings {
  const state = raw ?? {}
  return {
    themeMode: state.themeMode ?? defaultSettings.themeMode,
    remindersEnabled: toBool(state.remindersEnabled, defaultSettings.remindersEnabled),
    reminderHour: Number(state.reminderHour ?? defaultSettings.reminderHour),
    reminderMinute: Number(state.reminderMinute ?? defaultSettings.reminderMinute),
    dreamYogaEnabled: toBool(state.dreamYogaEnabled, defaultSettings.dreamYogaEnabled),
    dreamYogaBedtimeHour: Number(state.dreamYogaBedtimeHour ?? defaultSettings.dreamYogaBedtimeHour),
    dreamYogaBedtimeMinute: Number(state.dreamYogaBedtimeMinute ?? defaultSettings.dreamYogaBedtimeMinute),
    dreamYogaWakeHour: Number(state.dreamYogaWakeHour ?? defaultSettings.dreamYogaWakeHour),
    dreamYogaWakeMinute: Number(state.dreamYogaWakeMinute ?? defaultSettings.dreamYogaWakeMinute),
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
}

function applyDefaultDreamYogaSlots(): Partial<AppSettings> {
  return {
    dreamYogaBedtimeSlotEnabled: false,
    dreamYogaNight1SlotEnabled: true,
    dreamYogaNight2SlotEnabled: true,
    dreamYogaNight3SlotEnabled: true,
    dreamYogaNight4SlotEnabled: true,
    dreamYogaWakeSlotEnabled: false,
    dreamYogaSlotsInitialized: true,
  }
}

function ensureDreamYogaNightDefaults(settings: AppSettings): AppSettings {
  if (!settings.dreamYogaEnabled) return settings

  const anyNightEnabled =
    settings.dreamYogaNight1SlotEnabled ||
    settings.dreamYogaNight2SlotEnabled ||
    settings.dreamYogaNight3SlotEnabled ||
    settings.dreamYogaNight4SlotEnabled

  if (!settings.dreamYogaSlotsInitialized || !anyNightEnabled) {
    return { ...settings, ...applyDefaultDreamYogaSlots() }
  }

  return settings
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

      setDreamYogaTimes: (bedtime, wake) =>
        set({
          dreamYogaBedtimeHour: bedtime.h,
          dreamYogaBedtimeMinute: bedtime.m,
          dreamYogaWakeHour: wake.h,
          dreamYogaWakeMinute: wake.m,
        }),

      setDreamYogaBedtime: (hour, minute) =>
        set({ dreamYogaBedtimeHour: hour, dreamYogaBedtimeMinute: minute }),

      setDreamYogaWake: (hour, minute) =>
        set({ dreamYogaWakeHour: hour, dreamYogaWakeMinute: minute }),

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

      exportData: async () => {
        const s = get()
        const settings: AppSettings = {
          themeMode: s.themeMode,
          remindersEnabled: s.remindersEnabled,
          reminderHour: s.reminderHour,
          reminderMinute: s.reminderMinute,
          dreamYogaEnabled: s.dreamYogaEnabled,
          dreamYogaBedtimeHour: s.dreamYogaBedtimeHour,
          dreamYogaBedtimeMinute: s.dreamYogaBedtimeMinute,
          dreamYogaWakeHour: s.dreamYogaWakeHour,
          dreamYogaWakeMinute: s.dreamYogaWakeMinute,
          dreamYogaBedtimeSlotEnabled: s.dreamYogaBedtimeSlotEnabled,
          dreamYogaNight1SlotEnabled: s.dreamYogaNight1SlotEnabled,
          dreamYogaNight2SlotEnabled: s.dreamYogaNight2SlotEnabled,
          dreamYogaNight3SlotEnabled: s.dreamYogaNight3SlotEnabled,
          dreamYogaNight4SlotEnabled: s.dreamYogaNight4SlotEnabled,
          dreamYogaWakeSlotEnabled: s.dreamYogaWakeSlotEnabled,
          dreamYogaSlotsInitialized: s.dreamYogaSlotsInitialized,
          practitionerGender: s.practitionerGender,
          splashShown: s.splashShown,
        }
        return exportBackup(settings)
      },

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
      },
    }),
    {
      name: 'yungdrung-settings',
      version: 3,
      migrate: (persisted, version) => {
        const normalized = normalizeSettings(persisted as Partial<AppSettings>)
        if (version < 3) {
          return ensureDreamYogaNightDefaults(normalized)
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
        const fixed = ensureDreamYogaNightDefaults(state)
        if (fixed !== state) {
          useSettingsStore.setState(fixed)
        }
      },
      partialize: (state) => ({
        themeMode: state.themeMode,
        remindersEnabled: state.remindersEnabled,
        reminderHour: state.reminderHour,
        reminderMinute: state.reminderMinute,
        dreamYogaEnabled: state.dreamYogaEnabled,
        dreamYogaBedtimeHour: state.dreamYogaBedtimeHour,
        dreamYogaBedtimeMinute: state.dreamYogaBedtimeMinute,
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
      }),
    },
  ),
)

export const APP_VERSION = '1.0.0'
