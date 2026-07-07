import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '../lib/db'
import type { PractitionerGender, ThemeMode } from '../lib/types'

export interface AppSettings {
  themeMode: ThemeMode
  latitude: number | null
  longitude: number | null
  remindersEnabled: boolean
  reminderHour: number
  reminderMinute: number
  practitionerGender: PractitionerGender
  splashShown: boolean
}

interface SettingsState extends AppSettings {
  setThemeMode: (mode: ThemeMode) => void
  setCoordinates: (lat: number, lng: number) => void
  clearCoordinates: () => void
  setReminders: (enabled: boolean, hour?: number, minute?: number) => void
  setPractitionerGender: (gender: PractitionerGender) => void
  markSplashShown: () => void
  exportData: () => Promise<string>
  importData: (json: string) => Promise<void>
  resetAllData: () => Promise<void>
}

const defaultSettings: AppSettings = {
  themeMode: 'system',
  latitude: null,
  longitude: null,
  remindersEnabled: false,
  reminderHour: 7,
  reminderMinute: 0,
  practitionerGender: 'male',
  splashShown: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setThemeMode: (mode) => set({ themeMode: mode }),

      setCoordinates: (lat, lng) => set({ latitude: lat, longitude: lng }),

      clearCoordinates: () => set({ latitude: null, longitude: null }),

      setReminders: (enabled, hour, minute) =>
        set({
          remindersEnabled: enabled,
          ...(hour !== undefined ? { reminderHour: hour } : {}),
          ...(minute !== undefined ? { reminderMinute: minute } : {}),
        }),

      setPractitionerGender: (gender) => set({ practitionerGender: gender }),

      markSplashShown: () => set({ splashShown: true }),

      exportData: async () => {
        const [practices, practiceSessions, transmissions, dreams] = await Promise.all([
          db.practices.toArray(),
          db.practiceSessions.toArray(),
          db.transmissions.toArray(),
          db.dreams.toArray(),
        ])
        const settings = {
          themeMode: get().themeMode,
          latitude: get().latitude,
          longitude: get().longitude,
          remindersEnabled: get().remindersEnabled,
          reminderHour: get().reminderHour,
          reminderMinute: get().reminderMinute,
          practitionerGender: get().practitionerGender,
        }
        return JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), practices, practiceSessions, transmissions, dreams, settings },
          null,
          2,
        )
      },

      importData: async (json) => {
        const data = JSON.parse(json)
        await db.transaction('rw', db.practices, db.practiceSessions, db.transmissions, db.dreams, async () => {
          await db.practices.clear()
          await db.practiceSessions.clear()
          await db.transmissions.clear()
          await db.dreams.clear()
          if (data.practices) await db.practices.bulkAdd(data.practices)
          if (data.practiceSessions) await db.practiceSessions.bulkAdd(data.practiceSessions)
          if (data.transmissions) await db.transmissions.bulkAdd(data.transmissions)
          if (data.dreams) await db.dreams.bulkAdd(data.dreams)
        })
        if (data.settings) {
          const s = data.settings
          set({
            themeMode: s.themeMode ?? 'system',
            latitude: s.latitude ?? null,
            longitude: s.longitude ?? null,
            remindersEnabled: s.remindersEnabled ?? false,
            reminderHour: s.reminderHour ?? 7,
            reminderMinute: s.reminderMinute ?? 0,
            practitionerGender: s.practitionerGender ?? 'male',
          })
        }
      },

      resetAllData: async () => {
        await db.practices.clear()
        await db.practiceSessions.clear()
        await db.transmissions.clear()
        await db.dreams.clear()
      },
    }),
    {
      name: 'yungdrung-settings',
      partialize: (state) => ({
        themeMode: state.themeMode,
        latitude: state.latitude,
        longitude: state.longitude,
        remindersEnabled: state.remindersEnabled,
        reminderHour: state.reminderHour,
        reminderMinute: state.reminderMinute,
        practitionerGender: state.practitionerGender,
        splashShown: state.splashShown,
      }),
    },
  ),
)

export const APP_VERSION = '1.0.0'
