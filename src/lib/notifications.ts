/**
 * Browser Notification + Service Worker utilities for Campus-Grab
 * Handles permission requests, notification display, and SW registration
 */

let swRegistration: ServiceWorkerRegistration | null = null

/**
 * Register the service worker and return the registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        swRegistration = registration
        return registration
    } catch (err) {
        return null
    }
}

/**
 * Request notification permission from the user
 * Returns true if granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false
    }

    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    try {
        const result = await Notification.requestPermission()
        return result === 'granted'
    } catch {
        return false
    }
}

/**
 * Check if notification permission is granted
 */
export function hasNotificationPermission(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    return Notification.permission === 'granted'
}

/**
 * Show a notification — uses service worker if available (works in background),
 * falls back to Notification API (only works when tab is open)
 */
export async function showNotification(
    title: string,
    body: string,
    options?: {
        url?: string
        tag?: string
    }
): Promise<void> {
    if (!hasNotificationPermission()) return

    // Try service worker first (works even when app is in background)
    if (swRegistration) {
        try {
            // Send message to service worker to show notification
            if (swRegistration.active) {
                swRegistration.active.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    title,
                    body,
                    url: options?.url || '/',
                    tag: options?.tag || 'campus-grab-order',
                })
                return
            }
        } catch {
            // SW notification failed, fall back to Notification API
        }
    }

    // Fallback: use Notification API directly (only works when tab is in foreground)
    try {
        new Notification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: options?.tag || 'campus-grab-order',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200],
        } as NotificationOptions)
    } catch {
        // Failed to show notification
    }
}

/**
 * Show a new order notification (admin side)
 */
export function showNewOrderNotification(tokenNumber: string, itemCount: number, total: number): void {
    const formattedTotal = `₹${(total / 100).toFixed(0)}`
    showNotification(
        `🔔 New Order #${tokenNumber}`,
        `${itemCount} item${itemCount !== 1 ? 's' : ''} • ${formattedTotal} — Tap to view`,
        { url: '/admin/orders', tag: `order-${tokenNumber}` }
    )
}

/**
 * Show an order status update notification (student side)
 */
export function showOrderStatusNotification(tokenNumber: string, status: string): void {
    const statusMessages: Record<string, string> = {
        'preparing': '👨‍🍳 Your order is being prepared!',
        'ready': '✅ Your order is ready for pickup!',
        'completed': '🎉 Order completed. Enjoy your meal!',
    }

    const message = statusMessages[status] || `Order status updated to: ${status}`

    showNotification(
        `Order #${tokenNumber}`,
        message,
        { url: '/orders', tag: `order-status-${tokenNumber}` }
    )
}
