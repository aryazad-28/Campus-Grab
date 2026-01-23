'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, LogOut, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useOrders } from '@/components/OrdersProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
    const router = useRouter()
    const { user, signOut, isAuthenticated, isLoading } = useAuth()
    const { orders } = useOrders()

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <p className="text-neutral-500">Loading...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        router.push('/login')
        return null
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/')
    }

    const recentOrders = orders.slice(0, 3)

    return (
        <div className="container mx-auto max-w-lg px-4 py-8">
            {/* Profile Header */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                    <User className="h-10 w-10 text-neutral-400" />
                </div>
                <h1 className="text-2xl font-semibold">{user?.name}</h1>
                <p className="text-neutral-500">{user?.email}</p>
            </div>

            {/* User Info */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm">{user?.email}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                    <Link href="/orders" className="text-sm text-neutral-500 hover:text-neutral-900">
                        View all
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href="/orders"
                                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p className="text-sm font-medium">{order.id}</p>
                                            <p className="text-xs text-neutral-500">{order.items.length} items • ₹{order.total}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-neutral-500 py-4">
                            No orders yet
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Logout */}
            <Button
                variant="outline"
                className="w-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleLogout}
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </Button>
        </div>
    )
}
