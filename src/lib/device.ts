export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/i.test(ua)) return true

  // iPadOS 13+ may report as Mac with touch support
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function supportsPwaNotifications(): boolean {
  return !isIosDevice()
}
