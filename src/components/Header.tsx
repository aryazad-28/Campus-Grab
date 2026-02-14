'use client'

import Link from 'next/link'
import { ShoppingCart, User, Sun, Moon } from 'lucide-react'
import { useCart } from './CartProvider'
import { useAuth } from './AuthProvider'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/button'

export function Header() {
    const { cartCount } = useCart()
    const { isAuthenticated, user } = useAuth()

    let themeContext: { theme: 'light' | 'dark'; toggleTheme: () => void } | null = null
    try {
        themeContext = useTheme()
    } catch {
        // Not in theme provider context
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b glass transition-colors" style={{ borderColor: 'var(--border)' }}>
            <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
                <Link href="/" className="flex items-center gap-2 group">
                    <img
                        src="/logo.png"
                        alt="Campus Grab"
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-transform group-hover:scale-105"
                    />
                    <span className="text-base font-bold sm:text-lg text-red-500">
                        Campus Grab
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <Link href="/canteens">
                        <Button variant="ghost" size="sm">Canteens</Button>
                    </Link>

                    {themeContext && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={themeContext.toggleTheme}
                            title={themeContext.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        >
                            {themeContext.theme === 'light' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </Button>
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
                            <Button size="sm">Sign In</Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile: just theme toggle */}
                <div className="flex items-center gap-2 sm:hidden">
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
