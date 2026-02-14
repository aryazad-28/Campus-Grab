'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, UtensilsCrossed, ShoppingCart, UserCircle } from 'lucide-react'
import { useCart } from './CartProvider'
import { cn } from '@/lib/utils'

const tabs = [
    { href: '/canteens', icon: Home, label: 'Home' },
    { href: '/menu', icon: UtensilsCrossed, label: 'Menu' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: true },
    { href: '/profile', icon: UserCircle, label: 'Profile' },
]

export function BottomNav() {
    const pathname = usePathname()
    const { cartCount } = useCart()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass safe-area-bottom" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex h-16 items-center justify-around px-2">
                {tabs.map(({ href, icon: Icon, label, badge }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative min-w-[60px]",
                                isActive
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {isActive && (
                                <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-[#991B1B] to-[#DC2626]" />
                            )}
                            <div className="relative">
                                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                                {badge && cartCount > 0 && (
                                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#991B1B] to-[#DC2626] text-[9px] font-bold text-white">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive && "font-semibold"
                            )} >
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
