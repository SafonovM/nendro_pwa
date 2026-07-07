import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '../lib/db'
import { blobToBase64, base64ToBlob } from './practiceTextStore'
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
        const [practices, practiceSessions, transmissions, dreams, practiceTexts, textFiles] =
          await Promise.all([
            db.practices.toArray(),
            db.practiceSessions.toArray(),
            db.transmissions.toArray(),
            db.dreams.toArray(),
            db.practiceTexts.toArray(),
            db.practiceTextFiles.toArray(),
          ])

        const filesByTextId = new Map(textFiles.map((f) => [f.practiceTextId, f.blob]))
        const practiceTextsExport = await Promise.all(
          practiceTexts.map(async (text) => {
            const blob = text.id ? filesByTextId.get(text.id) : undefined
            const fileBase64 = blob ? await blobToBase64(blob) : undefined
            return {
              title: text.title,
              category: text.category,
              description: text.description,
              fileName: text.fileName,
              mimeType: text.mimeType,
              createdAt: text.createdAt,
              fileBase64,
            }
          }),
        )

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
        return JSON.stringify(
          {
            version: 2,
            exportedAt: new Date().toISOString(),
            practices,
            practiceSessions,
            transmissions,
            dreams,
            practiceTexts: practiceTextsExport,
            settings,
          },
          null,
          2,
        )
      },

      importData: async (json) => {
        const data = JSON.parse(json)
        await db.transaction(
          'rw',
          [
            db.practices,
            db.practiceSessions,
            db.transmissions,
            db.dreams,
            db.practiceTexts,
            db.practiceTextFiles,
          ],
          async () => {
            await db.practices.clear()
            await db.practiceSessions.clear()
            await db.transmissions.clear()
            await db.dreams.clear()
            await db.practiceTexts.clear()
            await db.practiceTextFiles.clear()
            if (data.practices) await db.practices.bulkAdd(data.practices)
            if (data.practiceSessions) await db.practiceSessions.bulkAdd(data.practiceSessions)
            if (data.transmissions) await db.transmissions.bulkAdd(data.transmissions)
            if (data.dreams) await db.dreams.bulkAdd(data.dreams)
            if (data.practiceTexts) {
              for (const item of data.practiceTexts) {
                const textId = await db.practiceTexts.add({
                  title: item.title,
                  category: item.category ?? 'custom',
                  description: item.description,
                  fileName: item.fileName,
                  mimeType: item.mimeType,
                  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
                })
                if (item.fileBase64 && item.fileName) {
                  const blob = base64ToBlob(item.fileBase64, item.mimeType ?? 'application/octet-stream')
                  await db.practiceTextFiles.add({ practiceTextId: textId, blob })
                }
              }
            }
          },
        )
        if (data.settings) {
          set(normalizeSettings(data.settings))
        }
      },

      resetAllData: async () => {
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
      version: 2,
      migrate: (persisted) => normalizeSettings(persisted as Partial<AppSettings>),
      merge: (persisted, current) => ({
        ...current,
        ...normalizeSettings(persisted as Partial<AppSettings>),
      }),
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
