'use client'

import Link from 'next/link'
import { ShoppingCart, User, Sun, Moon, Star } from 'lucide-react'
import { useCart } from './CartProvider'
import { useAuth } from './AuthProvider'
import { useTheme } from './ThemeProvider'
import { useRewards } from './RewardsProvider'
import { Button } from './ui/button'
import { useTranslations } from 'next-intl'

export function Header() {
    const { cartCount } = useCart()
    const { isAuthenticated, user } = useAuth()
    const t = useTranslations('Header')
    const { rewards } = useRewards()

    let themeContext: { theme: 'light' | 'dark'; toggleTheme: () => void } | null = null
    try {
        themeContext = useTheme()
    } catch {
        // Not in theme provider context
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b glass transition-colors" style={{ borderColor: 'var(--border)' }}>
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-16">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <img
                        src="/logo.png"
                        alt="Campus Grab"
                        className="h-10 w-10 sm:h-9 sm:w-9 rounded-full transition-transform group-hover:scale-105"
                    />
                    <span className="text-lg font-bold sm:text-lg text-red-500">
                        Campus Grab
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <Link href="/canteens">
                        <Button variant="ghost" size="sm">{t('canteens')}</Button>
                    </Link>

                    {themeContext && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={themeContext.toggleTheme}
                            title={themeContext.theme === 'light' ? t('darkMode') : t('lightMode')}
                        >
                            {themeContext.theme === 'light' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    {/* GrabPoints Badge — Desktop */}
                    {isAuthenticated && (
                        <Link href="/rewards" title="GrabPoints">
                            <div className="flex h-9 items-center justify-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    color: '#d97706',
                                }}
                            >
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                <span>{rewards?.balance ?? 0}</span>
                            </div>
                        </Link>
                    )}

                    <Link href="/cart" className="relative">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <ShoppingCart className="h-4 w-4" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="gap-1.5">
                                <User className="h-4 w-4" />
                                <span>{user?.name}</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button size="sm">{t('signIn')}</Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile: theme toggle + GrabPoints badge */}
                <div className="flex items-center gap-2 sm:hidden">
                    {/* GrabPoints Badge — Mobile */}
                    {isAuthenticated && (
                        <Link href="/rewards" title="GrabPoints">
                            <div className="flex h-9 items-center justify-center gap-1 rounded-full px-3 text-[11px] font-bold transition-all active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
                                    border: '1px solid rgba(245,158,11,0.3)',
                                    color: '#d97706',
                                }}
                            >
                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                <span>{rewards?.balance ?? 0}</span>
                            </div>
                        </Link>
                    )}

                    {themeContext && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={themeContext.toggleTheme}
                        >
                            {themeContext.theme === 'light' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
