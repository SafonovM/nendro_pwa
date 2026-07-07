export type PracticeCategory =
  | 'refuge'
  | 'bodhichitta'
  | 'hundred_syllable_mantra'
  | 'guru_yoga'
  | 'mandala_offering'
  | 'sale_o'
  | 'ma_tri'
  | 'du_tri_su'
  | 'custom'

export type TransmissionType = 'lung' | 'wang' | 'tri' | 'jenang'

export type DreamCategory = 'ordinary' | 'clarity' | 'lucid' | 'dream_yoga'

export type ThemeMode = 'system' | 'light' | 'dark'

export type PractitionerGender = 'male' | 'female'

export const NGONDRO_TOTAL = 100_000
export const NGONDRO_PLAN_DAYS = 100

export const PRACTICE_CATEGORY_LABELS: Record<PracticeCategory, string> = {
  refuge: 'Прибежище',
  bodhichitta: 'Боддхичитта',
  hundred_syllable_mantra: 'Стослоговая мантра',
  guru_yoga: 'Гуру-йога',
  mandala_offering: 'Подношение мандалы',
  sale_o: 'Сале О',
  ma_tri: 'Ма Три',
  du_tri_su: 'Ду Три Су',
  custom: 'Своё',
}

export const NGONDRO_CATEGORIES: PracticeCategory[] = [
  'refuge',
  'bodhichitta',
  'hundred_syllable_mantra',
  'guru_yoga',
  'mandala_offering',
]

export const FLEXIBLE_TARGET_CATEGORIES: PracticeCategory[] = [
  'custom',
  'sale_o',
  'ma_tri',
  'du_tri_su',
]

export const TRANSMISSION_TYPE_LABELS: Record<TransmissionType, string> = {
  lung: 'Лунг',
  wang: 'Ванг',
  tri: 'Три',
  jenang: 'Дженанг',
}

export const DREAM_CATEGORY_LABELS: Record<DreamCategory, string> = {
  ordinary: 'Обычные',
  clarity: 'Сны ясности',
  lucid: 'Осознанные',
  dream_yoga: 'Йога сновидений',
}

export function usesFlexibleTarget(category: PracticeCategory): boolean {
  return FLEXIBLE_TARGET_CATEGORIES.includes(category)
}

export function isNgondroCategory(category: PracticeCategory): boolean {
  return NGONDRO_CATEGORIES.includes(category)
}
