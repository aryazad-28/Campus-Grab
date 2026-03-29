'use client'

import Link from 'next/link'
import { Sun, Moon } from 'lucide-react'
import { useAdmin } from './AdminProvider'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/button'

export function AdminHeader() {
    const { admin } = useAdmin()

    let themeContext: { theme: 'light' | 'dark'; toggleTheme: () => void } | null = null
    try {
        themeContext = useTheme()
    } catch {
        // Not in theme provider context
    }

    const isOpen = admin?.is_open ?? false

    return (
        <header className="sticky top-0 z-50 w-full border-b glass transition-colors" style={{ borderColor: 'var(--border)' }}>
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-16">
                <Link href="/admin" className="flex items-center gap-2.5 group">
                    <img
                        src="/logo.png"
                        alt="Campus Grab"
                        className="h-10 w-10 sm:h-9 sm:w-9 rounded-full transition-transform group-hover:scale-105"
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold sm:text-lg text-blue-500">
                            {admin?.canteen_name || 'Admin'}
                        </span>
                        {/* Live status dot */}
                        <div className="relative flex h-2.5 w-2.5">
                            {isOpen && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                            )}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>
                    </div>
                </Link>

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

                {/* Desktop nav */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <Link href="/admin/orders">
                        <Button variant="ghost" size="sm">Orders</Button>
                    </Link>
                    <Link href="/admin/menu">
                        <Button variant="ghost" size="sm">Menu</Button>
                    </Link>
                    <Link href="/admin/analytics">
                        <Button variant="ghost" size="sm">Analytics</Button>
                    </Link>
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
                    <Link href="/admin/profile">
                        <Button variant="ghost" size="sm" className="gap-1.5">
                            {admin?.name || 'Profile'}
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
