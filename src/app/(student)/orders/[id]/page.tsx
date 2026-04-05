'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft, Copy, Check, Download, RotateCcw, Receipt,
    CreditCard, Calendar, User, Mail, ChefHat, Clock,
    Package, CheckCircle, Loader2, Store
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useCart } from '@/components/CartProvider'
import { generateInvoicePDF } from '@/lib/generate-invoice'
import { cn } from '@/lib/utils'

interface OrderDetail {
    id: string
    token_number: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    status: 'pending' | 'preparing' | 'ready' | 'completed'
    created_at: string
    estimated_time: number
    payment_method: string
    admin_id: string
    user_name?: string
    user_email?: string
    razorpay_payment_id?: string
    paid_at?: string
    payment_verified?: boolean
    admin_profiles?: {
        canteen_name: string
        canteen_image: string | null
        college_name: string
        area: string
    }
}

const STATUS_CONFIG = {
    pending: { label: 'Order received', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    preparing: { label: 'Being prepared', icon: ChefHat, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    ready: { label: 'Ready for pickup', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    completed: { label: 'Order was delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
}

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const { addToCart } = useCart()
    const orderId = params.id as string

    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    const fetchOrder = useCallback(async () => {
        if (!user?.id || !orderId) return
        try {
            const { supabase } = await import('@/lib/supabase')
            const session = supabase ? (await supabase.auth.getSession()).data.session : null
            const headers: Record<string, string> = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch(`/api/orders/history?user_id=${user.id}`, { headers })
            if (res.ok) {
                const data = await res.json()
                // Find the specific order from all days
                for (const day of data.days || []) {
                    const found = day.orders.find((o: any) => o.id === orderId)
                    if (found) {
                        setOrder(found)
                        break
                    }
                }
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false)
        }
    }, [user?.id, orderId])

    useEffect(() => {
        fetchOrder()
    }, [fetchOrder])

    const copyOrderId = () => {
        navigator.clipboard.writeText(order?.token_number || order?.id || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReorder = () => {
        if (!order) return
        for (const item of order.items) {
            for (let i = 0; i < item.quantity; i++) {
                addToCart({
                    id: `${item.name}-${Date.now()}-${i}`,
                    name: item.name,
                    price: item.price,
                    eta_minutes: order.estimated_time || 15,
                })
            }
        }
        router.push(`/cart?canteen=${order.admin_id}`)
    }

    const handleDownloadInvoice = () => {
        if (!order) return
        generateInvoicePDF({
            id: order.id,
            token_number: order.token_number,
            items: order.items,
            total: order.total,
            created_at: order.created_at,
            payment_method: order.payment_method,
            razorpay_payment_id: order.razorpay_payment_id,
            paid_at: order.paid_at,
            user_name: order.user_name,
            user_email: order.user_email,
            canteen_name: order.admin_profiles?.canteen_name,
            canteen_area: order.admin_profiles?.area,
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto max-w-md px-4 py-16 text-center">
                <p className="text-[var(--muted-foreground)] mb-4">Order not found</p>
                <Link href="/orders" className="text-red-500 underline">Back to Orders</Link>
            </div>
        )
    }

    const statusConfig = STATUS_CONFIG[order.status]
    const StatusIcon = statusConfig.icon
    const itemTotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const canteen = order.admin_profiles

    return (
        <div className="container mx-auto max-w-md px-4 py-6 pb-32">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 animate-fade-in-up">
                <button
                    onClick={() => router.back()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-elevated)] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-lg font-semibold">Order Details</h1>
            </div>

            {/* Status Banner */}
            <div className={cn(
                "rounded-2xl border p-4 mb-4 flex items-center gap-3 animate-fade-in-up delay-1",
                statusConfig.bg, statusConfig.border
            )}>
                <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
                <span className={cn("font-semibold text-sm", statusConfig.color)}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Canteen Info */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 mb-4 animate-fade-in-up delay-2">
                <div className="flex items-center gap-3">
                    {canteen?.canteen_image ? (
                        <img
                            src={canteen.canteen_image}
                            alt={canteen.canteen_name}
                            className="h-12 w-12 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="h-12 w-12 rounded-xl bg-[var(--card-elevated)] flex items-center justify-center">
                            <Store className="h-6 w-6 text-[var(--muted-foreground)]" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="font-semibold text-sm">{canteen?.canteen_name || 'Canteen'}</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            {canteen?.area || canteen?.college_name || ''}
                        </p>
                    </div>
                </div>

                {/* Order ID */}
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted-foreground)]">Order ID:</span>
                        <span className="font-mono font-bold text-sm">{order.token_number || order.id}</span>
                        <button
                            onClick={copyOrderId}
                            className="p-1 rounded-md hover:bg-[var(--card-elevated)] transition-colors"
                        >
                            {copied ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                                <Copy className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Summary (Items) */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 mb-4 animate-fade-in-up delay-3">
                <div className="space-y-3">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                                <span className="mt-0.5 h-4 w-4 rounded-sm border border-green-500 flex items-center justify-center flex-shrink-0">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.quantity} x {item.name}
                                    </p>
                                </div>
                            </div>
                            <span className="text-sm text-[var(--muted-foreground)] whitespace-nowrap">
                                ₹{(item.price * item.quantity).toFixed(0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bill Summary */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 mb-4 animate-fade-in-up delay-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <h3 className="font-semibold text-sm">Bill Summary</h3>
                    </div>
                    <button
                        onClick={handleDownloadInvoice}
                        className="p-2 rounded-lg hover:bg-[var(--card-elevated)] transition-colors"
                        title="Download bill"
                    >
                        <Download className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">Item total</span>
                        <span>₹{itemTotal.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                        <span className="font-semibold text-sm">Paid</span>
                        <span className="font-bold text-base">₹{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Customer & Payment Info */}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 mb-4 animate-fade-in-up delay-5">
                {/* Customer */}
                {(order.user_name || user?.name) && (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-[var(--card-elevated)] flex items-center justify-center">
                            <User className="h-5 w-5 text-[var(--muted-foreground)]" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{order.user_name || user?.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                                {order.user_email || user?.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Method */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-[var(--card-elevated)] flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Payment method</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Paid via: {order.payment_method === 'online' ? 'UPI / Online' : order.payment_method}
                        </p>
                        {order.razorpay_payment_id && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-mono">
                                {order.razorpay_payment_id}
                            </p>
                        )}
                    </div>
                </div>

                {/* Payment Date */}
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--card-elevated)] flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Payment date</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            {new Date(order.paid_at || order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })} at {new Date(order.paid_at || order.created_at).toLocaleTimeString('en-IN', {
                                hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Action Buttons (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 bg-[var(--background)] border-t border-[var(--border)] p-4 safe-area-bottom z-50">
                <div className="container mx-auto max-w-md flex gap-3">
                    <button
                        onClick={handleReorder}
                        className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 active:scale-[0.98] transition-all"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reorder
                    </button>
                    <button
                        onClick={handleDownloadInvoice}
                        className="flex-1 h-12 rounded-2xl border-2 border-red-500 text-red-500 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/5 active:scale-[0.98] transition-all"
                    >
                        <Download className="h-4 w-4" />
                        Invoice
                    </button>
                </div>
            </div>
        </div>
    )
}
