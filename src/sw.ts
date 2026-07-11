/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
void self.skipWaiting()
clientsClaim()

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification
  notification.close()

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of windowClients) {
        await client.focus()
        client.postMessage({
          type: 'ALARM_NOTIFICATION_CLICK',
          alarm: notification.data ?? null,
        })
        return
      }

      const launchUrl = new URL(self.registration.scope)
      const data = notification.data as { kind?: string; slot?: string } | undefined
      if (data?.kind) {
        launchUrl.searchParams.set('alarm', data.kind)
        if (data.slot) launchUrl.searchParams.set('slot', data.slot)
      }
      await self.clients.openWindow(launchUrl.toString())
    })(),
  )
})
