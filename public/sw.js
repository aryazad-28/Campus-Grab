// Campus Grab Service Worker
// Handles background push notifications for order updates

const CACHE_NAME = 'campus-grab-v1'

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

// Handle notification click — focus or open the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Try to focus an existing window
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus()
                    if (urlToOpen !== '/') {
                        client.navigate(urlToOpen)
                    }
                    return
                }
            }
            // No existing window — open a new one
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen)
            }
        })
    )
})

// Handle push events (for future server-sent push notifications)
self.addEventListener('push', (event) => {
    let data = { title: 'Campus Grab', body: 'You have a new notification', url: '/' }

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() }
        } catch {
            data.body = event.data.text()
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true,
            data: { url: data.url },
            tag: 'campus-grab-notification',
        })
    )
})

// Handle messages from the main app to show notifications
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, url, tag } = event.data

        self.registration.showNotification(title || 'Campus Grab', {
            body: body || 'New update',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true,
            data: { url: url || '/' },
            tag: tag || 'campus-grab-order',
        })
    }
})
