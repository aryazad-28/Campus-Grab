'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Utensils, ShoppingCart, User } from 'lucide-react'
import { useCart } from './CartProvider'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { href: '/canteens', label: 'Home', icon: Home },
    { href: '/menu', label: 'Menu', icon: Utensils },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
    const pathname = usePathname()
    const { cartCount } = useCart()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden animate-slide-in-bottom">
            <div className="glass border-t border-[#f0e0d6] dark:border-[#2d1f1a] safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-1">
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || pathname?.startsWith(href + '/')
                        const isCart = href === '/cart'

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-h-0 relative",
                                    isActive
                                        ? "text-[#F75412]"
                                        : "text-[#8a7060] dark:text-[#a89080] hover:text-[#C33811]"
                                )}
                            >
                                <div className="relative">
                                    <Icon className={cn(
                                        "h-5 w-5 transition-transform duration-200",
                                        isActive && "scale-110"
                                    )} />
                                    {isCart && cartCount > 0 && (
                                        <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#C33811] to-[#F75412] text-[9px] font-bold text-white animate-bounce-in">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-medium transition-colors",
                                    isActive && "font-semibold"
                                )}>
                                    {label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-1 h-[3px] w-6 rounded-full bg-gradient-to-r from-[#C33811] to-[#F75412]" />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
