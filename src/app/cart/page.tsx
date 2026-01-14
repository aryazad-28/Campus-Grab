'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Clock, CreditCard } from 'lucide-react'
import { useCart } from '@/components/CartProvider'
import { useOrders } from '@/components/OrdersProvider'
import { supabase } from '@/lib/supabase'
import { formatPrice, formatTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type CheckoutStep = 'cart' | 'payment' | 'confirmation'

export default function CartPage() {
    const router = useRouter()
    const { items, updateQuantity, removeFromCart, clearCart, cartTotal, maxEta } = useCart()
    const { addOrder } = useOrders()
    const [step, setStep] = useState<CheckoutStep>('cart')
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi')
    const [orderId, setOrderId] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const tax = Math.round(cartTotal * 0.05)
    const total = cartTotal + tax

    const handlePlaceOrder = async () => {
        if (items.length === 0) return

        setIsProcessing(true)

        try {
            // Add order to local OrdersProvider (for status tracking)
            const localOrderId = addOrder({
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: total,
                status: 'pending',
                estimated_time: maxEta
            })

            setOrderId(localOrderId)

            // Also try to save to Supabase if available
            if (supabase) {
                try {
                    await supabase
                        .from('orders')
                        .insert({
                            items: items.map(item => ({
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price
                            })),
                            subtotal: cartTotal,
                            tax: tax,
                            total: total,
                            estimated_time: maxEta,
                            payment_method: paymentMethod,
                            status: 'pending'
                        })
                } catch (err) {
                    console.warn('Supabase save failed (table may not exist):', err)
                }
            }

            clearCart()
            setStep('confirmation')
        } catch (err) {
            console.error('Order error:', err)
            // Simulate success for demo
            setOrderId('DEMO-' + Date.now().toString(36).toUpperCase())
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
                <p className="mb-6 text-neutral-500">Your order has been confirmed.</p>

                <Card className="mb-6 text-left">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Order ID</span>
                            <span className="font-mono text-sm">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Estimated Time</span>
                            <span>{formatTime(maxEta || 10)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Payment</span>
                            <Badge variant="success">{paymentMethod.toUpperCase()}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={() => router.push('/menu')} className="w-full">
                    Order More
                </Button>
            </div>
        )
    }

    // Payment view
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

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Select Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <button
                            onClick={() => setPaymentMethod('upi')}
                            className={`w-full rounded-lg border p-4 text-left transition-colors ${paymentMethod === 'upi'
                                ? 'border-neutral-900 bg-neutral-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">UPI</p>
                                    <p className="text-sm text-neutral-500">Pay using any UPI app</p>
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`w-full rounded-lg border p-4 text-left transition-colors ${paymentMethod === 'cash'
                                ? 'border-neutral-900 bg-neutral-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-5 w-5 items-center justify-center text-sm">₹</div>
                                <div>
                                    <p className="font-medium">Cash</p>
                                    <p className="text-sm text-neutral-500">Pay on pickup</p>
                                </div>
                            </div>
                        </button>
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
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
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

            <Button
                className="w-full"
                size="lg"
                onClick={() => setStep('payment')}
            >
                Proceed to Payment
            </Button>
        </div>
    )
}
