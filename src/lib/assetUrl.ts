/** Resolve public asset path with Vite base URL (for GitHub Pages subpath). */
export function assetUrl(path: string): string {
  const normalized = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${normalized}`
}
