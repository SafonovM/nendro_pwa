import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SanghaAccumulationState {
  scriptUrl: string
  accessVerified: boolean
  setScriptUrl: (url: string) => void
  setAccessVerified: (verified: boolean) => void
  clearAccess: () => void
}

/**
 * Isolated store: does not touch settingsStore / JSON backup / practices.
 * Existing users without this feature stay unaffected.
 */
export const useSanghaAccumulationStore = create<SanghaAccumulationState>()(
  persist(
    (set) => ({
      scriptUrl: '',
      accessVerified: false,
      setScriptUrl: (url) =>
        set({
          scriptUrl: url.trim(),
          accessVerified: false,
        }),
      setAccessVerified: (verified) => set({ accessVerified: verified }),
      clearAccess: () => set({ scriptUrl: '', accessVerified: false }),
    }),
    {
      name: 'yungdrung-sangha-accumulation',
      partialize: (state) => ({
        scriptUrl: state.scriptUrl,
        accessVerified: state.accessVerified,
      }),
    },
  ),
)
