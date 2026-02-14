'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, CreditCard, Loader2, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import { useOrders } from '@/components/OrdersProvider'
import { useAuth } from '@/components/AuthProvider'
import { useAI } from '@/components/AIProvider'
import { formatPrice, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'

type CheckoutStep = 'cart' | 'payment' | 'confirmation'

export default function CartPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
        }>
            <CartContent />
        </Suspense>
    )
}

function CartContent() {
    const router = useRouter()
    const t = useTranslations('Cart')
    const tCommon = useTranslations('Common')
    const searchParams = useSearchParams()
    const canteenId = searchParams.get('canteen') || (typeof window !== 'undefined' ? localStorage.getItem('campus-grab-selected-canteen') : null)
    const { items, updateQuantity, removeFromCart, clearCart, cartTotal, maxEta } = useCart()
    const { addOrder } = useOrders()
    const { isAuthenticated } = useAuth()
    const { trackNewOrder } = useAI()
    const [step, setStep] = useState<CheckoutStep>('cart')
    const [orderToken, setOrderToken] = useState<string | null>(null)
    const [orderTime, setOrderTime] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const tax = Math.round(cartTotal * 0.05)
    const total = cartTotal + tax

    const handlePlaceOrder = async () => {
        if (items.length === 0) return
        if (!isAuthenticated) { router.push('/login'); return }
        setIsProcessing(true)
        try {
            const newOrder = await addOrder({
                items: items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
                total: total,
                status: 'pending',
                estimated_time: maxEta,
                admin_id: canteenId || undefined,
                payment_method: 'online'
            })
            setOrderToken(newOrder.token_number)
            setOrderTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
            trackNewOrder({
                orderId: newOrder.id,
                items: items.map(item => ({ itemId: item.id, itemName: item.name, canteenId: canteenId || '1', estimatedTime: item.eta_minutes }))
            })
            clearCart()
            setStep('confirmation')
        } catch (err: any) {
            console.error('Order error:', err)
            alert(err.message || 'Failed to place order. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    // Empty cart
    if (items.length === 0 && step === 'cart') {
        return (
            <div className="container mx-auto px-4 py-16 text-center animate-fade-in-up">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--card)] animate-float">
                        <ShoppingBag className="h-10 w-10 text-[var(--muted-foreground)] opacity-40" />
                    </div>
                </div>
                <h1 className="mb-2 text-xl font-semibold">{t('emptyTitle')}</h1>
                <p className="mb-8 text-[var(--muted-foreground)]">{t('emptySubtitle')}</p>
                <Link href="/menu">
                    <Button>{t('browseMenu')}</Button>
                </Link>
            </div>
        )
    }

    // Confirmation
    if (step === 'confirmation') {
        return (
            <div className="container mx-auto max-w-md px-4 py-16 text-center">
                <div className="mb-6 flex justify-center animate-bounce-in">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-8 w-8 text-green-500" />
                    </div>
                </div>
                <h1 className="mb-2 text-xl font-semibold animate-fade-in-up delay-1">{t('orderPlaced')}</h1>
                <p className="mb-6 text-[var(--muted-foreground)] animate-fade-in-up delay-2">{t('orderSent')}</p>

                <div className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-3 text-left animate-fade-in-up delay-3">
                    <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">{t('tokenNumber')}</span>
                        <span className="font-mono text-lg font-bold text-red-500">{orderToken}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">{t('orderTime')}</span>
                        <span className="text-sm">{orderTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">{t('status')}</span>
                        <Badge variant="warning">{t('pendingApproval')}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">{t('payment')}</span>
                        <Badge variant="success">{t('paidOnline')}</Badge>
                    </div>
                </div>

                <div className="space-y-3 animate-fade-in-up delay-4">
                    <Link href="/orders">
                        <Button className="w-full">{t('trackOrder')}</Button>
                    </Link>
                    <Link href="/menu">
                        <Button variant="outline" className="w-full">{t('orderMore')}</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Payment
    if (step === 'payment') {
        return (
            <div className="container mx-auto max-w-md px-4 py-8 pb-32">
                <button onClick={() => setStep('cart')} className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    {t('backToCart')}
                </button>

                <h1 className="mb-6 text-xl font-semibold">{t('paymentTitle')}</h1>

                {!isAuthenticated && (
                    <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
                        <p className="text-sm text-amber-500 mb-3">{t('signInPrompt')}</p>
                        <Link href="/login"><Button size="sm">{t('signIn')}</Button></Link>
                    </div>
                )}

                <div className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4">
                    <h3 className="text-sm font-medium mb-3">{t('paymentMethod')}</h3>
                    <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="font-medium">{t('onlinePayment')}</p>
                                <p className="text-sm text-[var(--muted-foreground)]">{t('paymentDesc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">{t('subtotal')}</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">{t('tax')}</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-[var(--border)] pt-2 flex justify-between font-medium">
                        <span>{t('total')}</span>
                        <span className="text-red-500">{formatPrice(total)}</span>
                    </div>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !isAuthenticated}
                    className="w-full h-12 rounded-2xl bg-red-500 text-white font-semibold text-base hover:bg-red-600 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('processing')}
                        </span>
                    ) : (
                        `${t('pay')} ${formatPrice(total)}`
                    )}
                </button>
            </div>
        )
    }

    // Cart view — matching Figma: food images, quantity controls, red delete, big red CTA
    return (
        <div className="container mx-auto max-w-2xl px-4 py-6 pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                    <Link href="/menu" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-red-500/30 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold">{t('yourCart')}</h1>
                        <p className="text-xs text-[var(--muted-foreground)]">{items.length} items</p>
                    </div>
                </div>
                {/* Red trash icon top right — exactly like Figma */}
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Cart items — with food images like Figma */}
            <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-fade-in-up delay-${Math.min(index + 1, 8)}`}
                    >
                        {/* Food image placeholder */}
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-[var(--card-elevated)] flex items-center justify-center overflow-hidden">
                            <span className="text-2xl">🍽️</span>
                        </div>

                        {/* Name + price + quantity */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">{formatPrice(item.price)}</p>

                            {/* Quantity controls — like Figma: — 1 + */}
                            <div className="flex items-center gap-2 mt-1.5">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 active:scale-90 transition-all"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--card-elevated)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-green-500 active:scale-90 transition-all"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {/* Total price + delete */}
                        <div className="text-right flex flex-col items-end gap-2">
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500/60 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-semibold text-red-500">
                                {formatPrice(item.price * item.quantity)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Place Order button — full width red pill like Figma */}
            <button
                onClick={() => setStep('payment')}
                className="w-full h-12 rounded-2xl bg-red-500 text-white font-semibold text-base hover:bg-red-600 transition-all active:scale-[0.98] animate-fade-in-up delay-4"
            >
                Place Order · {formatPrice(total)}
            </button>
        </div>
    )
}
