'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, CreditCard, Loader2, ShoppingBag, Check } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import { useOrders } from '@/components/OrdersProvider'
import { useAuth } from '@/components/AuthProvider'
import { useAI } from '@/components/AIProvider'
import { formatPrice, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setIsProcessing(true)

        try {
            const newOrder = await addOrder({
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
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
                items: items.map(item => ({
                    itemId: item.id,
                    itemName: item.name,
                    canteenId: canteenId || '1',
                    estimatedTime: item.eta_minutes
                }))
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

    // Empty cart view
    if (items.length === 0 && step === 'cart') {
        return (
            <div className="container mx-auto px-4 py-16 text-center animate-fade-in-up">
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 animate-float">
                        <ShoppingBag className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-semibold">{t('emptyTitle')}</h1>
                <p className="mb-8 text-slate-500 dark:text-slate-400">{t('emptySubtitle')}</p>
                <Link href="/menu">
                    <Button>{t('browseMenu')}</Button>
                </Link>
            </div>
        )
    }

    // Order confirmation view
    if (step === 'confirmation') {
        return (
            <div className="container mx-auto max-w-md px-4 py-16 text-center">
                <div className="mb-6 flex justify-center animate-bounce-in">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-semibold animate-fade-in-up delay-1">{t('orderPlaced')}</h1>
                <p className="mb-6 text-slate-500 dark:text-slate-400 animate-fade-in-up delay-2">{t('orderSent')}</p>

                <Card className="mb-6 text-left animate-fade-in-up delay-3">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">{t('tokenNumber')}</span>
                            <span className="font-mono text-lg font-bold text-red-600 dark:text-red-400">{orderToken}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">{t('orderTime')}</span>
                            <span className="text-sm">{orderTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">{t('status')}</span>
                            <Badge variant="warning">{t('pendingApproval')}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">{t('payment')}</span>
                            <Badge variant="success">{t('paidOnline')}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 animate-fade-in-up delay-4">
                    {t('notificationHint')}
                </p>

                <div className="space-y-3 animate-fade-in-up delay-5">
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

    // Payment view
    if (step === 'payment') {
        return (
            <div className="container mx-auto max-w-md px-4 py-8 pb-32">
                <button
                    onClick={() => setStep('cart')}
                    className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('backToCart')}
                </button>

                <h1 className="mb-6 text-2xl font-semibold animate-fade-in-up">{t('paymentTitle')}</h1>

                {!isAuthenticated && (
                    <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/10 animate-fade-in-up delay-1">
                        <CardContent className="p-4">
                            <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">{t('signInPrompt')}</p>
                            <Link href="/login">
                                <Button size="sm">{t('signIn')}</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                <Card className="mb-6 animate-fade-in-up delay-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('paymentMethod')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10 p-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="font-medium text-emerald-900 dark:text-emerald-300">{t('onlinePayment')}</p>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-400">{t('paymentDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6 animate-fade-in-up delay-3">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('subtotal')}</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('tax')}</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-[#2D2D2D] pt-2 flex justify-between font-medium">
                            <span>{t('total')}</span>
                            <span className="text-red-600 dark:text-red-400">{formatPrice(total)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !isAuthenticated}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('processing')}
                        </>
                    ) : (
                        `${t('pay')} ${formatPrice(total)}`
                    )}
                </Button>
            </div>
        )
    }

    // Cart view
    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 pb-32">
            <Link href="/menu" className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors animate-fade-in">
                <ArrowLeft className="h-4 w-4" />
                {t('continueShopping')}
            </Link>

            <h1 className="mb-6 text-2xl font-semibold animate-fade-in-up">
                <span className="bg-gradient-to-r from-[#991B1B] to-[#DC2626] bg-clip-text text-transparent">{t('yourCart')}</span>
            </h1>

            <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                    <Card key={item.id} className={`animate-fade-in-up delay-${Math.min(index + 1, 8)}`}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{item.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{formatPrice(item.price)} each</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:border-red-300 hover:text-red-600 active:scale-90 transition-all"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full hover:border-emerald-300 hover:text-emerald-600 active:scale-90 transition-all"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="w-20 text-right font-medium text-red-600 dark:text-red-400">
                                {formatPrice(item.price * item.quantity)}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90 transition-all"
                                onClick={() => removeFromCart(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Estimated Time */}
            <Card className="mb-6 border-indigo-200 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-900/10 animate-fade-in-up delay-3">
                <CardContent className="flex items-center gap-3 p-4">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">{t('estimatedTime')}</p>
                        <p className="font-medium">{formatTime(maxEta)}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-6 animate-fade-in-up delay-4">
                <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{t('subtotal')}</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{t('tax')}</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-[#2D2D2D] pt-2 flex justify-between font-medium">
                        <span>{t('total')}</span>
                        <span className="text-red-600 dark:text-red-400 text-lg">{formatPrice(total)}</span>
                    </div>
                </CardContent>
            </Card>

            <Button className="w-full animate-fade-in-up delay-5" size="lg" onClick={() => setStep('payment')}>
                {t('proceedToPayment')}
            </Button>
        </div>
    )
}
