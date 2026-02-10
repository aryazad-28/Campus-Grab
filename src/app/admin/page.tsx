'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, UtensilsCrossed, LogOut, ClipboardList, Bell, BarChart3 } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useOrders } from '@/components/OrdersProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
    const router = useRouter()
    const { admin, isAuthenticated, isPending, needsOnboarding, isLoading, logout } = useAdmin()
    const { orders } = useOrders()

    useEffect(() => {
        if (!isLoading) {
            if (needsOnboarding || isPending) {
                router.push('/admin/onboarding')
            } else if (!isAuthenticated) {
                router.push('/admin/login')
            }
        }
    }, [isLoading, isAuthenticated, isPending, needsOnboarding, router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <p className="text-slate-400">Loading...</p>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        setTimeout(() => router.push('/login'), 100)
    }

    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const preparingOrders = orders.filter(o => o.status === 'preparing').length
    const readyOrders = orders.filter(o => o.status === 'ready').length

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Admin Header */}
            <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6 text-blue-400" />
                        <span className="text-lg font-semibold">{admin?.canteen_name || 'Admin Panel'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 hidden sm:block">{admin?.name}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white gap-2">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold">Welcome, {admin?.name}</h1>

                {/* Stats Cards */}
                <div className="grid gap-4 mb-8 sm:grid-cols-3">
                    <Card className="bg-amber-500/10 border-amber-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-amber-400">{pendingOrders}</p>
                            <p className="text-sm text-amber-300">New Orders</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-blue-400">{preparingOrders}</p>
                            <p className="text-sm text-blue-300">Preparing</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-emerald-400">{readyOrders}</p>
                            <p className="text-sm text-emerald-300">Ready</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Orders Management */}
                    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <ClipboardList className="h-5 w-5 text-blue-400" />
                                Orders
                                {pendingOrders > 0 && (
                                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                                        {pendingOrders}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                View and manage incoming orders. Update status as you prepare them.
                            </p>
                            <Link href="/admin/orders">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    View Orders
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Menu Management */}
                    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <UtensilsCrossed className="h-5 w-5 text-emerald-400" />
                                Menu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                Add, edit, or remove menu items. Changes sync instantly to students.
                            </p>
                            <Link href="/admin/menu">
                                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                                    Manage Menu
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <BarChart3 className="h-5 w-5 text-purple-400" />
                                Analytics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                View sales analytics, popular items, and order statistics.
                            </p>
                            <Link href="/admin/analytics">
                                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                                    View Analytics
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
