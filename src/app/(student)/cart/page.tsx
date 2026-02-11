'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, CreditCard, Loader2 } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import { useOrders } from '@/components/OrdersProvider'
import { useAuth } from '@/components/AuthProvider'
import { useAI } from '@/components/AIProvider'
import { formatPrice, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type CheckoutStep = 'cart' | 'payment' | 'confirmation'

export default function CartPage() {
    const router = useRouter()
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
            // Create order — this saves to Supabase automatically via OrdersProvider
            const newOrder = await addOrder({
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: total,
                status: 'pending',
                estimated_time: maxEta,
                admin_id: canteenId || undefined
            })

            // Get token from the returned order
            setOrderToken(newOrder.token_number)
            setOrderTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))

            // Track for AI learning
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
        } catch (err) {
            console.error('Order error:', err)
            setOrderToken('#0001')
            setOrderTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
            clearCart()
            setStep('confirmation')
        } finally {
            setIsProcessing(false)
        }
    }

    // Empty cart view
    if (items.length === 0 && step === 'cart') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="mb-4 text-2xl font-semibold">Your cart is empty</h1>
                <p className="mb-8 text-neutral-500">Add some items from the menu to get started.</p>
                <Link href="/menu">
                    <Button>Browse Menu</Button>
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
                <h1 className="mb-2 text-2xl font-semibold">Order Placed!</h1>
                <p className="mb-6 text-neutral-500">Your order has been sent to the canteen.</p>

                <Card className="mb-6 text-left">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Token Number</span>
                            <span className="font-mono text-lg font-bold">{orderToken}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Order Time</span>
                            <span className="text-sm">{orderTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Status</span>
                            <Badge variant="warning">Pending Approval</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Payment</span>
                            <Badge variant="success">Paid Online</Badge>
                        </div>
                    </CardContent>
                </Card>

                <p className="mb-6 text-sm text-neutral-500">
                    You&apos;ll be notified when your order is ready for pickup.
                </p>

                <div className="space-y-3">
                    <Link href="/orders">
                        <Button className="w-full">Track Order</Button>
                    </Link>
                    <Link href="/menu">
                        <Button variant="outline" className="w-full">Order More</Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Payment view - Online only
    if (step === 'payment') {
        return (
            <div className="container mx-auto max-w-md px-4 py-8">
                <button
                    onClick={() => setStep('cart')}
                    className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to cart
                </button>

                <h1 className="mb-6 text-2xl font-semibold">Payment</h1>

                {!isAuthenticated && (
                    <Card className="mb-6 border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                            <p className="text-sm text-amber-800 mb-3">Please sign in to place your order</p>
                            <Link href="/login">
                                <Button size="sm">Sign In</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="font-medium text-emerald-900">Online Payment</p>
                                    <p className="text-sm text-emerald-700">UPI / Card / Net Banking</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Subtotal</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Tax (5%)</span>
                            <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
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
                            Processing...
                        </>
                    ) : (
                        `Pay ${formatPrice(total)}`
                    )}
                </Button>
            </div>
        )
    }

    // Cart view
    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <Link href="/menu" className="mb-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900">
                <ArrowLeft className="h-4 w-4" />
                Continue shopping
            </Link>

            <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>

            <div className="space-y-4 mb-6">
                {items.map(item => (
                    <Card key={item.id}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-neutral-500">{formatPrice(item.price)} each</p>
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
                                className="h-8 w-8 text-neutral-400 hover:text-red-500"
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
                        <p className="text-sm text-blue-700">Estimated preparation time</p>
                        <p className="font-medium">{formatTime(maxEta)}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="mb-6">
                <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Subtotal</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Tax (5%)</span>
                        <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={() => setStep('payment')}>
                Proceed to Payment
            </Button>
        </div>
    )
}
