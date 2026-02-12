'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building, MapPin, Phone, Mail, Loader2, LogOut } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export default function AdminProfilePage() {
    const router = useRouter()
    const { admin, isAuthenticated, isLoading, logout } = useAdmin()
    const t = useTranslations('Admin')
    const tCommon = useTranslations('Common')

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        setTimeout(() => router.push('/login'), 100)
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800">
                <div className="container mx-auto flex h-14 items-center justify-between px-4">
                    <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">{t('dashboard')}</span>
                    </Link>
                    <h1 className="text-lg font-semibold">{t('profile')}</h1>
                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-2xl">
                <div className="space-y-6">
                    {/* Profile Card */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader className="pb-4 border-b border-slate-700">
                            <CardTitle className="flex items-center gap-3 text-xl text-white">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <p>{admin?.name}</p>
                                    <p className="text-sm font-normal text-slate-400">{admin?.email}</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <Building className="h-3 w-3" />
                                        {t('canteenName')}
                                    </label>
                                    <p className="font-medium">{admin?.canteen_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {t('college')}
                                    </label>
                                    <p className="font-medium">{admin?.college_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {t('phone')}
                                    </label>
                                    <p className="font-medium">{admin?.phone || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500 flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {t('email')}
                                    </label>
                                    <p className="font-medium">{admin?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings Card */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Language</span>
                                <LanguageSwitcher />
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                                <Button
                                    variant="destructive"
                                    className="w-full gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                    {tCommon('signOut')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
