'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, ClipboardList, User, Store } from 'lucide-react'
import { useCart } from './CartProvider'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/canteens', icon: Store, label: 'Canteens' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart' },
    { href: '/orders', icon: ClipboardList, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileNav() {
    const pathname = usePathname()
    const { cartCount } = useCart()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm dark:bg-neutral-900/95 dark:border-neutral-800 sm:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + '/')
                    const isCart = href === '/cart'

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px] relative",
                                isActive
                                    ? "text-neutral-900 dark:text-white"
                                    : "text-neutral-500 dark:text-neutral-400"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn(
                                    "h-6 w-6 transition-transform",
                                    isActive && "scale-110"
                                )} />
                                {isCart && cartCount > 0 && (
                                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-[10px] font-bold text-white dark:text-neutral-900">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive && "font-semibold"
                            )}>
                                {label}
                            </span>
                            {isActive && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-neutral-900 dark:bg-white" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
