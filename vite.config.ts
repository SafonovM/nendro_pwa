import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const repoName = process.env.VITE_REPO_NAME || 'nendro_pwa'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const base = isGitHubPages ? `/${repoName}/` : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.svg', 'splash.svg'],
      manifest: {
        name: 'Дневник практики Юнгдрунг Бон',
        short_name: 'Юнгдрунг Бон',
        description: 'Дневник буддийских практик, передач и сновидений',
        theme_color: '#8B1A1A',
        background_color: '#FAF5EB',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ru',
        scope: base,
        start_url: base,
        icons: [
          { src: 'icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: 'icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,mp4,woff2}'],
        maximumFileSizeToCacheInBytes: 250 * 1024 * 1024,
      },
    }),
  ],
})
