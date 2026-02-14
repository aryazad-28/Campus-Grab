'use client'

import Link from 'next/link'
import { Clock, ChefHat, Package, CheckCircle, ArrowLeft } from 'lucide-react'
import { useOrders, Order } from '@/components/OrdersProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'completed'] as const
const STATUS_CONFIG: Record<Order['status'], { label: string; icon: typeof Clock; color: string; activeColor: string }> = {
    pending: { label: 'Received', icon: Clock, color: 'text-amber-500', activeColor: 'bg-amber-500' },
    preparing: { label: 'Preparing', icon: ChefHat, color: 'text-[#F75412]', activeColor: 'bg-[#F75412]' },
    ready: { label: 'Ready', icon: Package, color: 'text-emerald-500', activeColor: 'bg-emerald-500' },
    completed: { label: 'Picked Up', icon: CheckCircle, color: 'text-[#8a7060]', activeColor: 'bg-[#8a7060]' }
}

function OrderTimeline({ status }: { status: Order['status'] }) {
    const currentIdx = STATUS_STEPS.indexOf(status)

    return (
        <div className="flex items-center gap-0 mt-4">
            {STATUS_STEPS.map((step, idx) => {
                const config = STATUS_CONFIG[step]
                const Icon = config.icon
                const isCompleted = idx < currentIdx
                const isActive = idx === currentIdx
                const isFuture = idx > currentIdx

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        {/* Step dot/icon */}
                        <div className="flex flex-col items-center gap-1.5 relative">
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                                isCompleted && `${config.activeColor} text-white`,
                                isActive && `${config.activeColor} text-white animate-pulse-glow`,
                                isFuture && "bg-[#f0e0d6] dark:bg-[#2d1f1a] text-[#8a7060]"
                            )}>
                                {isCompleted ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <Icon className="h-4 w-4" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium whitespace-nowrap absolute -bottom-5",
                                isActive ? config.color : isCompleted ? "text-[#8a7060]" : "text-[#8a7060] opacity-50"
                            )}>
                                {config.label}
                            </span>
                        </div>

                        {/* Connecting line */}
                        {idx < STATUS_STEPS.length - 1 && (
                            <div className="flex-1 mx-1">
                                <div className={cn(
                                    "h-[2px] w-full rounded-full transition-all duration-500",
                                    idx < currentIdx ? config.activeColor : "bg-[#f0e0d6] dark:bg-[#2d1f1a]"
                                )} />
                            </div>
                        )}
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
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Separate active and past orders
    const activeOrders = orders.filter(o => o.status !== 'completed')
    const pastOrders = orders.filter(o => o.status === 'completed')

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 pb-32">
            <Link href="/profile" className="mb-6 flex items-center gap-2 text-sm text-[#8a7060] hover:text-[#F75412] transition-colors animate-fade-in">
                <ArrowLeft className="h-4 w-4" />
                Back to profile
            </Link>

            <h1 className="mb-6 text-2xl font-bold animate-fade-in-up">
                <span className="bg-gradient-to-r from-[#C33811] to-[#F75412] bg-clip-text text-transparent">Order</span> History
            </h1>

            {orders.length > 0 ? (
                <div className="space-y-8">
                    {/* Active Orders */}
                    {activeOrders.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-[#C33811] uppercase tracking-wider animate-fade-in">Active Orders</h2>
                            {activeOrders.map((order, index) => {
                                const config = STATUS_CONFIG[order.status]

                                return (
                                    <Card key={order.id} className={`animate-fade-in-up delay-${Math.min(index + 1, 8)} overflow-hidden`}>
                                        {/* Gradient top strip */}
                                        <div className="h-1 bg-gradient-to-r from-[#C33811] via-[#F75412] to-[#FB882C]" />
                                        <CardContent className="p-4">
                                            <div className="mb-3 flex items-start justify-between">
                                                <div>
                                                    <p className="font-mono text-lg font-bold">{order.token_number || order.id}</p>
                                                    <p className="text-sm text-[#8a7060]">{formatDate(order.created_at)}</p>
                                                </div>
                                                <Badge variant={
                                                    order.status === 'ready' ? 'success' :
                                                        order.status === 'preparing' ? 'secondary' : 'warning'
                                                } className="gap-1">
                                                    <config.icon className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                            </div>

                                            <div className="mb-3 space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{item.quantity}x {item.name}</span>
                                                        <span className="text-[#8a7060]">₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Timeline */}
                                            <div className="pb-4">
                                                <OrderTimeline status={order.status} />
                                            </div>

                                            <div className="flex items-center justify-between border-t border-[#f0e0d6] dark:border-[#2d1f1a] pt-3 mt-4">
                                                <span className="font-medium">Total</span>
                                                <span className="font-semibold">₹{order.total}</span>
                                            </div>

                                            {order.status === 'ready' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#C33811] via-[#F75412] to-[#FB882C] py-2.5 text-sm font-medium text-white hover:brightness-110 transition-all active:scale-[0.98]"
                                                >
                                                    Mark as Picked Up
                                                </button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {/* Past Orders */}
                    {pastOrders.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-[#8a7060] uppercase tracking-wider animate-fade-in">Past Orders</h2>
                            {pastOrders.map((order, index) => (
                                <Card key={order.id} className={`animate-fade-in-up delay-${Math.min(index + 1, 8)} opacity-80`}>
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div>
                                                <p className="font-mono text-lg font-bold">{order.token_number || order.id}</p>
                                                <p className="text-sm text-[#8a7060]">{formatDate(order.created_at)}</p>
                                            </div>
                                            <Badge variant="outline" className="gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                Completed
                                            </Badge>
                                        </div>

                                        <div className="mb-3 space-y-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span className="text-[#8a7060]">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-[#f0e0d6] dark:border-[#2d1f1a] pt-3">
                                            <span className="font-medium">Total</span>
                                            <span className="font-semibold">₹{order.total}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-16 text-center animate-fade-in">
                    <p className="mb-4 text-[#8a7060]">No orders yet</p>
                    <Link href="/canteens" className="text-[#F75412] underline hover:no-underline font-medium">
                        Browse canteens
                    </Link>
                </div>
            )}
        </div>
    )
}
