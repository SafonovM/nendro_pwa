import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(import.meta.dirname, '..', 'dist')
const index = join(dist, 'index.html')
const notFound = join(dist, '404.html')

if (!existsSync(index)) {
  console.error('dist/index.html not found — run vite build first')
  process.exit(1)
}

copyFileSync(index, notFound)
console.log('Created dist/404.html for GitHub Pages SPA routing')
