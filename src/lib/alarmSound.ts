import type { AlarmKind } from './notifications'

let audioContext: AudioContext | null = null
let soundTimer: ReturnType<typeof setInterval> | null = null
let activeOscillator: OscillatorNode | null = null
let activeGain: GainNode | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!audioContext) {
    audioContext = new Ctx()
  }
  return audioContext
}

function stopTone() {
  if (activeOscillator) {
    try {
      activeOscillator.stop()
    } catch {
      // already stopped
    }
    activeOscillator.disconnect()
    activeOscillator = null
  }
  if (activeGain) {
    activeGain.disconnect()
    activeGain = null
  }
}

function playTone(kind: AlarmKind) {
  const ctx = getAudioContext()
  if (!ctx) return

  void ctx.resume().catch(() => {})

  stopTone()

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = kind === 'dream_yoga' ? 880 : 660
  gain.gain.value = 0.0001
  oscillator.connect(gain)
  gain.connect(ctx.destination)

  const now = ctx.currentTime
  const pulse = kind === 'dream_yoga' ? 0.45 : 0.35
  const gap = kind === 'dream_yoga' ? 0.2 : 0.15

  for (let i = 0; i < 4; i++) {
    const start = now + i * (pulse + gap)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.03)
    gain.gain.setValueAtTime(0.35, start + pulse - 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + pulse)
  }

  oscillator.start(now)
  oscillator.stop(now + 4 * (pulse + gap))

  activeOscillator = oscillator
  activeGain = gain
}

export function supportsAlarmSound(): boolean {
  return getAudioContext() != null
}

export function startAlarmSound(kind: AlarmKind) {
  stopAlarmSound()
  playTone(kind)
  const cycleMs = kind === 'dream_yoga' ? 3200 : 2600
  soundTimer = setInterval(() => playTone(kind), cycleMs)
}

export function stopAlarmSound() {
  if (soundTimer) {
    clearInterval(soundTimer)
    soundTimer = null
  }
  stopTone()
  void audioContext?.suspend().catch(() => {})
}

export async function unlockAlarmAudio(): Promise<void> {
  const ctx = getAudioContext()
  if (!ctx) return
  await ctx.resume().catch(() => {})
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  gain.gain.value = 0.0001
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.02)
}
