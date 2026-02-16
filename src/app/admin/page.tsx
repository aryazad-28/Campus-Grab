'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, UtensilsCrossed, LogOut, ClipboardList, Bell, BarChart3, Power } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { useOrders } from '@/components/OrdersProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

export default function AdminDashboard() {
    const router = useRouter()
    const { admin, isAuthenticated, isPending, needsOnboarding, isLoading, logout, toggleOpen } = useAdmin()
    const { orders } = useOrders()
    const t = useTranslations('Admin')
    const tCommon = useTranslations('Common')
    const [isToggling, setIsToggling] = useState(false)

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
                <p className="text-slate-400">{tCommon('loading')}</p>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        setTimeout(() => router.push('/login'), 100)
    }

    const handleToggleOpen = async () => {
        setIsToggling(true)
        await toggleOpen()
        setIsToggling(false)
    }

    const isOpen = admin?.is_open ?? false
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
                        <span className="text-lg font-semibold">{admin?.canteen_name || t('dashboard')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/admin/profile" className="text-sm text-slate-400 hover:text-white transition-colors">
                            {admin?.name}
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white gap-2">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">{tCommon('signOut')}</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold">{t('welcome', { name: admin?.name || '' })}</h1>

                {/* ✨ Canteen Open/Close Toggle Card */}
                <div className="mb-8">
                    <Card className={`relative overflow-hidden border-2 transition-all duration-500 ${isOpen
                            ? 'bg-emerald-500/5 border-emerald-500/40'
                            : 'bg-red-500/5 border-red-500/40'
                        }`}>
                        {/* Animated background glow */}
                        <div className={`absolute inset-0 transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'
                            }`}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        </div>
                        <div className={`absolute inset-0 transition-opacity duration-700 ${!isOpen ? 'opacity-100' : 'opacity-0'
                            }`}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        </div>

                        <CardContent className="relative p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Animated status dot */}
                                    <div className={`relative flex h-3 w-3`}>
                                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-red-400'
                                            }`} />
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-emerald-500' : 'bg-red-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">
                                            Canteen Status
                                        </h3>
                                        <p className={`text-sm font-medium transition-colors duration-300 ${isOpen ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                            {isOpen ? '● Accepting Orders' : '● Closed for Orders'}
                                        </p>
                                    </div>
                                </div>

                                {/* Toggle Button */}
                                <button
                                    onClick={handleToggleOpen}
                                    disabled={isToggling}
                                    className={`group relative flex items-center gap-3 rounded-full px-6 py-3 font-semibold text-sm transition-all duration-300 ${isToggling ? 'opacity-50 cursor-wait' :
                                            isOpen
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20'
                                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20'
                                        }`}
                                >
                                    <Power className={`h-5 w-5 transition-transform duration-300 ${isToggling ? 'animate-spin' : 'group-hover:scale-110'
                                        }`} />
                                    {isToggling
                                        ? 'Updating...'
                                        : isOpen ? 'Close Canteen' : 'Open Canteen'
                                    }
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 mb-8 sm:grid-cols-3">
                    <Card className="bg-amber-500/10 border-amber-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-amber-400">{pendingOrders}</p>
                            <p className="text-sm text-amber-300">{t('newOrders')}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-blue-400">{preparingOrders}</p>
                            <p className="text-sm text-blue-300">{t('preparing')}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500/10 border-emerald-500/30">
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-emerald-400">{readyOrders}</p>
                            <p className="text-sm text-emerald-300">{t('ready')}</p>
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
                                {t('orders')}
                                {pendingOrders > 0 && (
                                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                                        {pendingOrders}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                {t('ordersDesc')}
                            </p>
                            <Link href="/admin/orders">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    {t('viewOrders')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Menu Management */}
                    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <UtensilsCrossed className="h-5 w-5 text-emerald-400" />
                                {t('menu')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                {t('menuDesc')}
                            </p>
                            <Link href="/admin/menu">
                                <Button variant="outline" className="w-full border-slate-600 text-emerald-400 hover:bg-slate-700">
                                    {t('manageMenu')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Analytics */}
                    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <BarChart3 className="h-5 w-5 text-purple-400" />
                                {t('analytics')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                {t('analyticsDesc')}
                            </p>
                            <Link href="/admin/analytics">
                                <Button variant="outline" className="w-full border-slate-600 text-purple-400 hover:bg-slate-700">
                                    {t('viewAnalytics')}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
