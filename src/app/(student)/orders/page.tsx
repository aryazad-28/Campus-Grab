'use client'

import Link from 'next/link'
import { Clock, ChefHat, Package, CheckCircle, ArrowLeft, Utensils } from 'lucide-react'
import { useOrders, Order } from '@/components/OrdersProvider'
import { cn } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'completed'] as const
const STATUS_CONFIG: Record<Order['status'], { label: string; sublabel: string; icon: typeof Clock; activeColor: string; activeBg: string }> = {
    pending: { label: 'Order Received', sublabel: 'In progress...', icon: CheckCircle, activeColor: 'text-red-500', activeBg: 'bg-red-500' },
    preparing: { label: 'Preparing', sublabel: 'Being cooked', icon: Clock, activeColor: 'text-amber-500', activeBg: 'bg-amber-500' },
    ready: { label: 'Ready for Pickup', sublabel: 'Waiting at counter', icon: Package, activeColor: 'text-green-500', activeBg: 'bg-green-500' },
    completed: { label: 'Picked Up', sublabel: 'Completed', icon: Utensils, activeColor: 'text-[var(--muted-foreground)]', activeBg: 'bg-[var(--muted-foreground)]' }
}

/* Vertical timeline matching Figma exactly */
function OrderTimeline({ status }: { status: Order['status'] }) {
    const currentIdx = STATUS_STEPS.indexOf(status)

    return (
        <div className="space-y-0">
            {STATUS_STEPS.map((step, idx) => {
                const config = STATUS_CONFIG[step]
                const Icon = config.icon
                const isCompleted = idx < currentIdx
                const isActive = idx === currentIdx
                const isFuture = idx > currentIdx

                return (
                    <div key={step} className="flex gap-3">
                        {/* Vertical line + circle */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
                                isCompleted && `${config.activeBg} text-white`,
                                isActive && `${config.activeBg} text-white animate-pulse-glow`,
                                isFuture && "bg-[var(--card-elevated)] text-[var(--muted-foreground)]"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            {/* Connecting line */}
                            {idx < STATUS_STEPS.length - 1 && (
                                <div className={cn(
                                    "w-0.5 h-8 my-1 rounded-full transition-colors",
                                    idx < currentIdx ? config.activeBg : "bg-[var(--border)]"
                                )} />
                            )}
                        </div>

                        {/* Label */}
                        <div className="pt-2">
                            <p className={cn(
                                "text-sm font-medium",
                                isActive ? config.activeColor : isCompleted ? "" : "text-[var(--muted-foreground)]"
                            )}>
                                {config.label}
                            </p>
                            {isActive && (
                                <p className="text-xs text-[var(--muted-foreground)]">{config.sublabel}</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default function OrdersPage() {
    const { orders, updateOrderStatus } = useOrders()

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    }

    const activeOrders = orders.filter(o => o.status !== 'completed')
    const pastOrders = orders.filter(o => o.status === 'completed')

    if (orders.length === 0) {
        return (
            <div className="container mx-auto max-w-md px-4 py-16 text-center animate-fade-in">
                <Clock className="mx-auto h-12 w-12 text-[var(--muted-foreground)] opacity-30 mb-4" />
                <p className="text-[var(--muted-foreground)] mb-4">No orders yet</p>
                <Link href="/canteens" className="text-red-500 underline hover:no-underline font-medium">
                    Browse canteens
                </Link>
            </div>
        )
    }

    // If showing a single active order (like Figma's order tracking screen)
    if (activeOrders.length > 0) {
        const order = activeOrders[0]
        const config = STATUS_CONFIG[order.status]

        return (
            <div className="container mx-auto max-w-md px-4 py-6 pb-32">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
                    <Link href="/canteens" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)]">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold">Order Tracking</h1>
                        <p className="text-xs text-[var(--muted-foreground)]">{order.token_number || `ORD-${order.id}`}</p>
                    </div>
                </div>

                {/* Order Status Card */}
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 mb-4 animate-fade-in-up delay-1">
                    <h2 className="text-base font-semibold mb-4">Order Status</h2>
                    <OrderTimeline status={order.status} />
                </div>

                {/* Canteen Details */}
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 mb-4 animate-fade-in-up delay-2">
                    <h2 className="text-base font-semibold mb-3">Canteen Details</h2>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-[var(--muted-foreground)]">{item.quantity}x {item.name}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="border-t border-[var(--border)] pt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span className="text-red-500">₹{order.total}</span>
                        </div>
                    </div>
                </div>

                {order.status === 'ready' && (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="w-full h-12 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all active:scale-[0.98] animate-fade-in-up delay-3"
                    >
                        Mark as Picked Up
                    </button>
                )}

                {/* Other active orders */}
                {activeOrders.length > 1 && (
                    <div className="mt-6 space-y-3">
                        <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Other Active Orders</h3>
                        {activeOrders.slice(1).map(o => (
                            <div key={o.id} className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-3 flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-sm font-bold">{o.token_number || o.id}</p>
                                    <p className="text-xs text-[var(--muted-foreground)]">{o.items.length} items · ₹{o.total}</p>
                                </div>
                                <span className={cn("text-xs font-medium", STATUS_CONFIG[o.status].activeColor)}>
                                    {STATUS_CONFIG[o.status].label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Past orders */}
                {pastOrders.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Past Orders</h3>
                        {pastOrders.map(o => (
                            <div key={o.id} className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-3 flex items-center justify-between opacity-60">
                                <div>
                                    <p className="font-mono text-sm font-bold">{o.token_number || o.id}</p>
                                    <p className="text-xs text-[var(--muted-foreground)]">{formatDate(o.created_at)} · ₹{o.total}</p>
                                </div>
                                <span className="text-xs text-[var(--muted-foreground)]">Completed</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // Only past orders — list view
    return (
        <div className="container mx-auto max-w-md px-4 py-6 pb-32">
            <h1 className="text-lg font-semibold mb-4 animate-fade-in-up">Order History</h1>
            <div className="space-y-3">
                {pastOrders.map((o, index) => (
                    <div key={o.id} className={`rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 animate-fade-in-up delay-${Math.min(index + 1, 8)}`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-mono font-bold">{o.token_number || o.id}</p>
                            <span className="text-xs text-[var(--muted-foreground)]">{formatDate(o.created_at)}</span>
                        </div>
                        <div className="space-y-1">
                            {o.items.map((item, idx) => (
                                <p key={idx} className="text-sm text-[var(--muted-foreground)]">{item.quantity}x {item.name}</p>
                            ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-[var(--border)] flex justify-between text-sm font-medium">
                            <span>Total</span>
                            <span>₹{o.total}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
