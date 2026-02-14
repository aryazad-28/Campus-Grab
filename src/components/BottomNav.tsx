'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, ShoppingCart, Clock, UserCircle } from 'lucide-react'
import { useCart } from './CartProvider'
import { cn } from '@/lib/utils'

const tabs = [
    { href: '/canteens', icon: Home, label: 'Home' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: true },
    { href: '/orders', icon: Clock, label: 'Orders' },
    { href: '/profile', icon: UserCircle, label: 'Admin' },
]

export function BottomNav() {
    const pathname = usePathname()
    const { cartCount } = useCart()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-[var(--border)] bg-[var(--background)] safe-area-bottom">
            <div className="flex h-16 items-center justify-around px-2">
                {tabs.map(({ href, icon: Icon, label, badge }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 transition-colors relative min-w-[56px]",
                                isActive
                                    ? "text-red-500"
                                    : "text-[var(--muted-foreground)]"
                            )}
                        >
                            <div className="relative">
                                <Icon className="h-5 w-5" />
                                {badge && cartCount > 0 && (
                                    <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                        {cartCount > 9 ? '9+' : cartCount}
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
