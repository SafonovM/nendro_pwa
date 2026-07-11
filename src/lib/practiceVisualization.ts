import type { PractitionerGender, PracticeCategory } from './types'

export interface PracticeVisualization {
  posterPath: string | null
  videoPaths: string[]
}

import { assetUrl } from './assetUrl'

const BASE = assetUrl('practice_visualizations')

const VISUALIZATION_CATEGORIES: PracticeCategory[] = ['sale_o', 'ma_tri', 'du_tri_su']

export function hasVisualization(category: PracticeCategory): boolean {
  return VISUALIZATION_CATEGORIES.includes(category)
}

export function resolveVisualization(
  category: PracticeCategory,
  gender: PractitionerGender,
): PracticeVisualization | null {
  if (!hasVisualization(category)) return null

  switch (category) {
    case 'sale_o':
      return {
        posterPath: `${BASE}/sale_o/poster.png`,
        videoPaths: [`${BASE}/sale_o/visualization.mp4`],
      }
    case 'ma_tri': {
      const male = `${BASE}/ma_tri/male/visualization.mp4`
      const female = `${BASE}/ma_tri/female/visualization.mp4`
      return {
        posterPath: `${BASE}/ma_tri/poster.png`,
        videoPaths: gender === 'male' ? [male, female] : [female, male],
      }
    }
    case 'du_tri_su':
      return {
        posterPath:
          gender === 'male'
            ? `${BASE}/du_tri_su/male/poster.png`
            : `${BASE}/du_tri_su/female/poster.png`,
        videoPaths: [`${BASE}/du_tri_su/visualization.mp4`],
      }
    default:
      return null
  }
}

export async function assetExists(url: string): Promise<boolean> {
  if (url.startsWith('blob:')) return true
  try {
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  } catch {
    return false
  }
}

export function resolveCustomVisualization(
  posterUrl: string | null,
  videoUrls: string[],
): PracticeVisualization | null {
  if (!posterUrl && videoUrls.length === 0) return null
  return {
    posterPath: posterUrl,
    videoPaths: videoUrls,
  }
}
