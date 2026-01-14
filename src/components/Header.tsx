'use client'

import Link from 'next/link'
import { ShoppingCart, Utensils, User } from 'lucide-react'
import { useCart } from './CartProvider'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'

export function Header() {
    const { cartCount } = useCart()
    const { isAuthenticated, user } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <Utensils className="h-6 w-6" />
                    <span className="text-lg font-semibold">Campus Grab</span>
                </Link>

                <nav className="flex items-center gap-2">
                    <Link href="/menu">
                        <Button variant="ghost" size="sm">Menu</Button>
                    </Link>

                    <Link href="/cart" className="relative">
                        <Button variant="outline" size="icon">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <Link href="/profile">
                            <Button variant="ghost" size="sm" className="gap-1.5">
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">{user?.name}</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">Sign In</Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
