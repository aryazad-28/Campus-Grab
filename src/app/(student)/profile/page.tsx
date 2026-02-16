'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, LogOut, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useOrders } from '@/components/OrdersProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function ProfilePage() {
    const router = useRouter()
    const { user, signOut, isAuthenticated, isLoading } = useAuth()
    const { orders } = useOrders()
    const t = useTranslations('Profile')
    const tCommon = useTranslations('Common')

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <p className="text-neutral-500 dark:text-neutral-400">{tCommon('loading')}</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        router.push('/login')
        return null
    }

    const handleLogout = async () => {
        await signOut()
        router.push('/login')
    }

    const recentOrders = orders.slice(0, 3)

    return (
        <div className="container mx-auto max-w-lg px-4 py-8">
            {/* Profile Header */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <User className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{user?.name}</h1>
                <p className="text-neutral-500 dark:text-neutral-400">{user?.email}</p>
            </div>

            {/* User Info */}
            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-neutral-900 dark:text-white">{t('title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{user?.email}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Language Settings */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base text-neutral-900 dark:text-white">{t('language')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('selectLanguage')}</span>
                        <LanguageSwitcher />
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base text-neutral-900 dark:text-white">{t('recentOrders')}</CardTitle>
                    <Link href="/orders" className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200">
                        {tCommon('viewAll')}
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href="/orders"
                                    className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{order.id}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{tCommon('items', { count: order.items.length })} • {tCommon('currency', { amount: order.total })}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 py-4">
                            {tCommon('noOrders')}
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
                {tCommon('signOut')}
            </Button>
        </div>
    )
}
