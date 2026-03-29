'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ClipboardList, UtensilsCrossed, BarChart3, UserCircle } from 'lucide-react'
import { useOrders } from './OrdersProvider'
import { cn } from '@/lib/utils'

const tabs = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/orders', icon: ClipboardList, label: 'Orders', badge: true },
    { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/profile', icon: UserCircle, label: 'Profile' },
]

export function AdminBottomNav() {
    const pathname = usePathname()

    // Try to get orders for badge - may fail if not in provider
    let pendingCount = 0
    try {
        const { orders } = useOrders()
        pendingCount = orders.filter(o => o.status === 'preparing').length
    } catch {
        // Not in orders provider context (e.g. login page)
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-[var(--border)] bg-[var(--background)] safe-area-bottom">
            <div className="flex h-16 items-center justify-around px-1">
                {tabs.map(({ href, icon: Icon, label, badge, exact }) => {
                    const isActive = exact
                        ? pathname === href
                        : pathname === href || pathname?.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 transition-colors relative min-w-[52px]",
                                isActive
                                    ? "text-blue-500"
                                    : "text-[var(--muted-foreground)]"
                            )}
                        >
                            <div className="relative">
                                <Icon className="h-5 w-5" />
                                {badge && pendingCount > 0 && (
                                    <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                                        {pendingCount > 9 ? '9+' : pendingCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
