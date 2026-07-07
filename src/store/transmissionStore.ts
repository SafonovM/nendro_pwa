import { create } from 'zustand'
import { db, type Transmission } from '../lib/db'
import type { TransmissionType } from '../lib/types'

interface TransmissionState {
  transmissions: Transmission[]
  loading: boolean
  loadTransmissions: () => Promise<void>
  addTransmission: (data: Omit<Transmission, 'id'>) => Promise<void>
  deleteTransmission: (id: number) => Promise<void>
}

export const useTransmissionStore = create<TransmissionState>((set, get) => ({
  transmissions: [],
  loading: false,

  loadTransmissions: async () => {
    set({ loading: true })
    const transmissions = await db.transmissions.orderBy('date').reverse().toArray()
    set({ transmissions, loading: false })
  },

  addTransmission: async (data) => {
    await db.transmissions.add(data)
    await get().loadTransmissions()
  },

  deleteTransmission: async (id) => {
    await db.transmissions.delete(id)
    await get().loadTransmissions()
  },
}))

export type { TransmissionType }
