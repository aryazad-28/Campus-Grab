'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, CreditCard, Loader2, Gift, AlertTriangle, Star, Info } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import { useOrders } from '@/components/OrdersProvider'
import { useAuth } from '@/components/AuthProvider'
import { useAI } from '@/components/AIProvider'
import { useRewards } from '@/components/RewardsProvider'
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
    const { items, updateQuantity, removeFromCart, clearCart, cartTotal, convenienceFee, orderTotal, maxEta } = useCart()
    const { addOrder } = useOrders()
    const { isAuthenticated, user } = useAuth()
    const { trackNewOrder } = useAI()
    const { rewards, refreshRewards } = useRewards()
    const [step, setStep] = useState<CheckoutStep>('cart')
    const [orderToken, setOrderToken] = useState<string | null>(null)
    const [orderTime, setOrderTime] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null)
    const [earnedPoints, setEarnedPoints] = useState<number | null>(null)
    const [unlockedVouchers, setUnlockedVouchers] = useState<any[]>([])

    // Final total after fee and discount
    const voucherDiscount = selectedVoucherId
        ? rewards?.active_vouchers.find(v => v.id === selectedVoucherId)?.discount_amount || 0
        : 0
    const finalTotal = Math.max(0, orderTotal - voucherDiscount)

    const handleToggleVoucher = (voucherId: string) => {
        if (selectedVoucherId === voucherId) {
            setSelectedVoucherId(null)
        } else {
            setSelectedVoucherId(voucherId)
        }
    }

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
            // No client-side redemption needed. Voucher is validated server-side.

            // Step 1: Create order in database (status: pending)
            const newOrder = await addOrder({
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: cartTotal,
                status: 'pending',
                estimated_time: maxEta,
                admin_id: canteenId,
                payment_method: 'online',
                user_name: user?.name || undefined,
                user_email: user?.email || undefined
            })

            // Step 2: Create Razorpay order via API (adds convenience fee server-side)
            const razorpayRes = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: newOrder.id,
                    canteenId: canteenId,
                    voucherId: selectedVoucherId,
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
                        // Step 4: Verify payment on server (also awards reward points)
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

                        const verifyData = await verifyRes.json()

                        // Capture earned points from the response
                        if (verifyData.rewards?.points_earned) {
                            setEarnedPoints(verifyData.rewards.points_earned)
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
                        if (verifyData.rewards?.vouchers_unlocked?.length > 0) {
                            setUnlockedVouchers(verifyData.rewards.vouchers_unlocked)
                        }
                        refreshRewards() // Refresh reward balance
                        setStep('confirmation')
                    } catch (error: any) {
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

                {/* Reward Points Earned */}
                {earnedPoints && earnedPoints > 0 && (
                    <Card className="mb-6 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-700">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                                <Star className="h-5 w-5 text-amber-600 fill-amber-500" />
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                    You earned {earnedPoints} GrabPoints!
                                </p>
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Keep ordering to fill your meter and unlock rewards!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Vouchers Unlocked */}
                {unlockedVouchers.length > 0 && (
                    <div className="mb-6 space-y-3">
                        <h3 className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-2">
                            🎉 Reward Unlocked! 🎉
                        </h3>
                        {unlockedVouchers.map((voucher, idx) => (
                            <Card key={idx} className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 dark:bg-emerald-900">
                                        <Gift className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                            {voucher.title}
                                        </p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                            ₹{voucher.amount} off your next order! Check your rewards profile.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Liability Disclaimer */}
                <div className="mb-6 flex items-start gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-800/50 p-3 text-left">
                    <Info className="h-4 w-4 mt-0.5 text-neutral-500 shrink-0" />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        CampusGrab is a platform service. Food quality concerns should be addressed directly with the canteen.
                    </p>
                </div>

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

                {/* Available Vouchers */}
                {isAuthenticated && rewards && rewards.active_vouchers && rewards.active_vouchers.length > 0 && (
                    <Card className="mb-6 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Gift className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium">Available Rewards</span>
                                </div>
                                <span className="text-xs font-mono text-emerald-600">
                                    {rewards.active_vouchers.length} Vouchers
                                </span>
                            </div>

                            <div className="space-y-2">
                                {rewards.active_vouchers.map(voucher => {
                                    const isSelected = selectedVoucherId === voucher.id
                                    return (
                                        <button
                                            key={voucher.id}
                                            onClick={() => handleToggleVoucher(voucher.id)}
                                            className={`w-full text-left rounded-lg border p-3 transition-colors flex justify-between items-center ${isSelected
                                                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700'
                                                : 'border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-neutral-700'
                                                }`}
                                        >
                                            <div>
                                                <p className={`text-sm font-medium ${isSelected ? 'text-emerald-800 dark:text-emerald-300' : ''}`}>
                                                    {voucher.title}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {voucher.description}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`font-bold ${isSelected ? 'text-emerald-600' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                                    -₹{voucher.discount_amount}
                                                </span>
                                                {isSelected && (
                                                    <span className="text-[10px] uppercase font-bold text-emerald-600">Applied</span>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Order Summary */}
                <Card className="mb-6">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">{t('subtotal')}</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Convenience fee</span>
                            <span>{formatPrice(convenienceFee)}</span>
                        </div>
                        {selectedVoucherId && voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span className="flex items-center gap-1">
                                    <Gift className="h-3 w-3" /> Voucher applied
                                </span>
                                <span>−{formatPrice(voucherDiscount)}</span>
                            </div>
                        )}
                        <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                            <span>{t('total')}</span>
                            <span>{formatPrice(finalTotal)}</span>
                        </div>
                    </CardContent >
                </Card >

                {/* Refund Policy Disclaimer */}
                <Card className="mb-6 border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800/30">
                    <CardContent className="p-3 flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                                All orders are final once placed
                            </p>
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 mt-0.5">
                                No refunds for change of mind or delays. <Link href="/refund" className="underline">Refund Policy</Link>
                            </p>
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
                        `${t('pay')} ${formatPrice(finalTotal)}`
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
                        <span className="text-neutral-500">Convenience fee</span>
                        <span>{formatPrice(convenienceFee)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                        <span>{t('total')}</span>
                        <span>{formatPrice(orderTotal)}</span>
                    </div>
                </CardContent >
            </Card >

            <Button className="w-full" size="lg" onClick={() => setStep('payment')}>
                {t('proceedToPayment')}
            </Button>
        </div >
    )
}
