'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Utensils, User, Menu, X } from 'lucide-react'
import { useCart } from './CartProvider'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'

export function Header() {
    const { cartCount } = useCart()
    const { isAuthenticated, user } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
                <Link href="/" className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-base font-semibold sm:text-lg">Campus Grab</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <Link href="/menu">
                        <Button variant="ghost" size="sm">Menu</Button>
                    </Link>

                    <Link href="/cart" className="relative">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <ShoppingCart className="h-4 w-4" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
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
                    <Link href="/cart" className="relative">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <ShoppingCart className="h-4 w-4" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] text-white">
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
                <div className="border-t border-neutral-200 bg-white px-4 py-3 sm:hidden">
                    <div className="flex flex-col gap-2">
                        <Link href="/menu" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">Menu</Button>
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
