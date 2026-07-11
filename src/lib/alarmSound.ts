import type { AlarmKind } from './notifications'
import { assetUrl } from './assetUrl'

const GONG_SOUND_URL = assetUrl('sounds/temple_gong.mp3')

let audio: HTMLAudioElement | null = null

function createGongAudio(): HTMLAudioElement {
  const element = new Audio(GONG_SOUND_URL)
  element.preload = 'auto'
  return element
}

export function supportsAlarmSound(): boolean {
  return typeof Audio !== 'undefined'
}

export function startAlarmSound(_kind: AlarmKind) {
  stopAlarmSound()
  audio = createGongAudio()
  audio.loop = true
  void audio.play().catch(() => {})
}

export function stopAlarmSound() {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio = null
  }
}

export async function unlockAlarmAudio(): Promise<void> {
  const probe = createGongAudio()
  probe.volume = 0.0001
  try {
    await probe.play()
    probe.pause()
    probe.currentTime = 0
  } catch {
    // User gesture may be required on first unlock
  }
}

export function getAlarmSoundUrl(): string {
  return GONG_SOUND_URL
}
