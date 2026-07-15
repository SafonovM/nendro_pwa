import type { DreamCategory, PracticeCategory, TransmissionType } from './types'

const PRACTICE_TO_ANDROID: Record<PracticeCategory, string> = {
  refuge: 'REFUGE',
  bodhichitta: 'BODHICHITTA',
  hundred_syllable_mantra: 'HUNDRED_SYLLABLE_MANTRA',
  guru_yoga: 'GURU_YOGA',
  mandala_offering: 'MANDALA_OFFERING',
  sale_o: 'SALE_O',
  ma_tri: 'MA_TRI',
  du_tri_su: 'DU_TRI_SU',
  custom: 'CUSTOM',
}

const ANDROID_TO_PRACTICE: Record<string, PracticeCategory> = {
  REFUGE: 'refuge',
  BODHICHITTA: 'bodhichitta',
  HUNDRED_SYLLABLE_MANTRA: 'hundred_syllable_mantra',
  GURU_YOGA: 'guru_yoga',
  MANDALA_OFFERING: 'mandala_offering',
  SALE_O: 'sale_o',
  MA_TRI: 'ma_tri',
  DU_TRI_SU: 'du_tri_su',
  CUSTOM: 'custom',
  PROSTRATIONS: 'refuge',
  MANTRAS: 'hundred_syllable_mantra',
  SYLLABLE_VISUALIZATION: 'hundred_syllable_mantra',
  MANDALA_OFFERINGS: 'mandala_offering',
}

const TRANSMISSION_TO_ANDROID: Record<TransmissionType, string> = {
  lung: 'LUNG',
  wang: 'WANG',
  tri: 'TRI',
  jenang: 'JENANG',
}

const ANDROID_TO_TRANSMISSION: Record<string, TransmissionType> = {
  LUNG: 'lung',
  WANG: 'wang',
  TRI: 'tri',
  JENANG: 'jenang',
}

const DREAM_TO_ANDROID: Record<DreamCategory, string> = {
  ordinary: 'ORDINARY',
  clarity: 'CLARITY',
  lucid: 'LUCID',
  dream_yoga: 'DREAM_YOGA',
}

const ANDROID_TO_DREAM: Record<string, DreamCategory> = {
  ORDINARY: 'ordinary',
  CLARITY: 'clarity',
  LUCID: 'lucid',
  DREAM_YOGA: 'dream_yoga',
}

export function practiceCategoryToAndroid(category: PracticeCategory): string {
  return PRACTICE_TO_ANDROID[category]
}

export function practiceCategoryFromAndroid(value: string): PracticeCategory {
  const mapped = ANDROID_TO_PRACTICE[value]
  if (!mapped) throw new Error(`Unknown practice category: ${value}`)
  return mapped
}

export function transmissionTypeToAndroid(type: TransmissionType): string {
  return TRANSMISSION_TO_ANDROID[type]
}

export function transmissionTypeFromAndroid(value: string): TransmissionType {
  const mapped = ANDROID_TO_TRANSMISSION[value] ?? ANDROID_TO_TRANSMISSION[value.toUpperCase()]
  if (!mapped) throw new Error(`Unknown transmission type: ${value}`)
  return mapped
}

export function dreamCategoryToAndroid(category: DreamCategory): string {
  return DREAM_TO_ANDROID[category]
}

export function dreamCategoryFromAndroid(value: string): DreamCategory {
  const mapped = ANDROID_TO_DREAM[value]
  if (!mapped) throw new Error(`Unknown dream category: ${value}`)
  return mapped
}
