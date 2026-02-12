'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Utensils, User, Menu, X, Sun, Moon } from 'lucide-react'
import { useCart } from './CartProvider'
import { useAuth } from './AuthProvider'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/button'

export function Header() {
    const { cartCount } = useCart()
    const { isAuthenticated, user } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Try to get theme context (may not exist if not in student layout)
    let themeContext: { theme: 'light' | 'dark'; toggleTheme: () => void } | null = null
    try {
        themeContext = useTheme()
    } catch {
        // Not in theme provider context
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm transition-colors" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Campus Grab" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
                    <span className="text-base font-semibold sm:text-lg">Campus Grab</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <Link href="/canteens">
                        <Button variant="ghost" size="sm">Canteens</Button>
                    </Link>

                    {/* Theme Toggle */}
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
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-[10px] text-white dark:text-neutral-900">
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

                {/* Mobile Navigation */}
                <div className="flex items-center gap-2 sm:hidden">
                    {/* Theme Toggle Mobile */}
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

                    <Link href="/cart" className="relative">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <ShoppingCart className="h-4 w-4" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-[10px] text-white dark:text-neutral-900">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 sm:hidden transition-colors">
                    <div className="flex flex-col gap-2">
                        <Link href="/canteens" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">Canteens</Button>
                        </Link>
                        <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">My Orders</Button>
                        </Link>
                        {isAuthenticated ? (
                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <User className="h-4 w-4" />
                                    {user?.name}
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <Button className="w-full">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
