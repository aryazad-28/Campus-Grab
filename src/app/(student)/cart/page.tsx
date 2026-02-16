'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, CreditCard, Loader2 } from 'lucide-react'
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
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600 dark:text-neutral-400" />
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
    const { isAuthenticated, user } = useAuth()
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

        if (!canteenId) {
            alert('Please select a canteen first')
            return
        }

        setIsProcessing(true)

        try {
            // Step 1: Create order in database (status: pending)
            const newOrder = await addOrder({
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: total,
                status: 'pending',
                estimated_time: maxEta,
                admin_id: canteenId,
                payment_method: 'online'
            })

            // Step 2: Create Razorpay order via API
            const razorpayRes = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: newOrder.id,
                    canteenId: canteenId,
                }),
            })

            if (!razorpayRes.ok) {
                const error = await razorpayRes.json()
                throw new Error(error.error || 'Failed to create payment order')
            }

            const razorpayData = await razorpayRes.json()

            // Step 3: Open Razorpay Checkout (UPI only — optimized for speed)
            const options = {
                key: razorpayData.key_id,
                amount: razorpayData.amount,
                currency: razorpayData.currency,
                name: razorpayData.canteen_name,
                description: `Order #${newOrder.token_number}`,
                order_id: razorpayData.razorpay_order_id,
                method: {
                    upi: true,
                    card: false,
                    netbanking: false,
                    wallet: false,
                    paylater: false,
                    emi: false,
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: 'Pay via UPI',
                                instruments: [
                                    { method: 'upi', flows: ['qrcode', 'collect', 'intent'] }
                                ],
                            },
                        },
                        sequence: ['block.upi'],
                        preferences: { show_default_blocks: false },
                    },
                },
                prefill: {
                    email: user?.email || '',
                },
                handler: async function (response: any) {
                    try {
                        // Step 4: Verify payment on server
                        const verifyRes = await fetch('/api/razorpay/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: newOrder.id,
                            }),
                        })

                        if (!verifyRes.ok) {
                            throw new Error('Payment verification failed')
                        }

                        // Payment successful
                        setOrderToken(newOrder.token_number)
                        setOrderTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))

                        // Track for AI learning
                        trackNewOrder({
                            orderId: newOrder.id,
                            items: items.map(item => ({
                                itemId: item.id,
                                itemName: item.name,
                                canteenId: canteenId,
                                estimatedTime: item.eta_minutes
                            }))
                        })

                        clearCart()
                        setStep('confirmation')
                    } catch (error: any) {
                        console.error('Payment verification error:', error)
                        alert('Payment verification failed. Please contact support.')
                    } finally {
                        setIsProcessing(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false)
                        alert('Payment cancelled. Your order is still pending.')
                    },
                    confirm_close: true,
                },
                theme: {
                    color: '#EF4444'
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (err: any) {
            console.error('Order/Payment error:', err)
            alert(err.message || 'Failed to initiate payment. Please try again.')
            setIsProcessing(false)
        }
    }


    // Empty cart view
    if (items.length === 0 && step === 'cart') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="mb-4 text-2xl font-semibold">{t('emptyTitle')}</h1>
                <p className="mb-8 text-neutral-600 dark:text-neutral-400">{t('emptySubtitle')}</p>
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
                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-semibold">{t('orderPlaced')}</h1>
                <p className="mb-6 text-neutral-600 dark:text-neutral-400">{t('orderSent')}</p>

                <Card className="mb-6 text-left">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('tokenNumber')}</span>
                            <span className="font-mono text-lg font-bold">{orderToken}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('orderTime')}</span>
                            <span className="text-sm">{orderTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('status')}</span>
                            <Badge variant="warning">{t('pendingApproval')}</Badge>
                        </div >
                        <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('payment')}</span>
                            <Badge variant="success">{t('paidOnline')}</Badge>
                        </div >
                    </CardContent >
                </Card >

                <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                    {t('notificationHint')}
                </p>

                <div className="space-y-3">
                    <Link href="/orders">
                        <Button className="w-full">{t('trackOrder')}</Button>
                    </Link>
                    <Link href="/menu">
                        <Button variant="outline" className="w-full">{t('orderMore')}</Button>
                    </Link>
                </div>
            </div >
        )
    }

    // Payment view - Online only
    if (step === 'payment') {
        return (
            <div className="container mx-auto max-w-md px-4 py-8">
                <button
                    onClick={() => setStep('cart')}
                    className="mb-6 flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('backToCart')}
                </button>

                <h1 className="mb-6 text-2xl font-semibold">{t('paymentTitle')}</h1>

                {!isAuthenticated && (
                    <Card className="mb-6 border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                            <p className="text-sm text-amber-800 mb-3">{t('signInPrompt')}</p>
                            <Link href="/login">
                                <Button size="sm">{t('signIn')}</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t('paymentMethod')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="font-medium text-emerald-900">{t('onlinePayment')}</p>
                                    <p className="text-sm text-emerald-700">{t('paymentDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('subtotal')}</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('tax')}</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                            <span>{t('total')}</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </CardContent >
                </Card >

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
            </div >
        )
    }

    // Cart view
    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <Link href="/menu" className="mb-6 flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200">
                <ArrowLeft className="h-4 w-4" />
                {t('continueShopping')}
            </Link>

            <h1 className="mb-6 text-2xl font-semibold">{t('yourCart')}</h1>

            <div className="space-y-4 mb-6">
                {items.map(item => (
                    <Card key={item.id}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{formatPrice(item.price)} each</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="w-20 text-right font-medium">
                                {formatPrice(item.price * item.quantity)}
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-neutral-500 hover:text-red-500 dark:text-neutral-400"
                                onClick={() => removeFromCart(item.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Estimated Time */}
            <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="flex items-center gap-3 p-4">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                        <p className="text-sm text-blue-700">{t('estimatedTime')}</p>
                        <p className="font-medium">{formatTime(maxEta)}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-6">
                <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">{t('subtotal')}</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">{t('tax')}</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                        <span>{t('total')}</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </CardContent >
            </Card >

            <Button className="w-full" size="lg" onClick={() => setStep('payment')}>
                {t('proceedToPayment')}
            </Button>
        </div >
    )
}
