'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Building, MapPin, Phone, Mail, Loader2, LogOut, History, CalendarDays, ChevronDown, IndianRupee, CheckCircle, Camera, ImageIcon } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

interface DaySummary {
    date: string
    orderCount: number
    totalRevenue: number
}

interface DayOrders {
    date: string
    orders: any[]
    orderCount: number
    totalRevenue: number
}

const MONTH_KEYS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
] as const

export default function AdminProfilePage() {
    const router = useRouter()
    const { admin, isAuthenticated, isLoading, logout } = useAdmin()
    const t = useTranslations('Admin')
    const tCommon = useTranslations('Common')
    const tOrders = useTranslations('Orders')

    // Order History state
    const [showHistory, setShowHistory] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [daySummaries, setDaySummaries] = useState<DaySummary[]>([])
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [dayOrders, setDayOrders] = useState<DayOrders | null>(null)
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [showMonthDropdown, setShowMonthDropdown] = useState(false)
    const [showYearDropdown, setShowYearDropdown] = useState(false)
    const [canteenImageUrl, setCanteenImageUrl] = useState('')
    const [isSavingImage, setIsSavingImage] = useState(false)
    const [imageSaveMsg, setImageSaveMsg] = useState<string | null>(null)

    useEffect(() => {
        if (admin?.canteen_image) setCanteenImageUrl(admin.canteen_image)
    }, [admin])

    const handleSaveCanteenImage = async () => {
        if (!admin || !supabase) return
        setIsSavingImage(true)
        setImageSaveMsg(null)
        try {
            const { error } = await supabase
                .from('admin_profiles')
                .update({ canteen_image: canteenImageUrl || null })
                .eq('id', admin.id)
            if (error) throw error
            setImageSaveMsg('Image saved!')
            setTimeout(() => setImageSaveMsg(null), 3000)
        } catch {
            setImageSaveMsg('Failed to save')
        }
        setIsSavingImage(false)
    }

    // Fetch month summaries
    const fetchMonthSummaries = useCallback(async () => {
        if (!admin?.id) return
        setIsLoadingHistory(true)
        try {
            const res = await fetch(`/api/orders/vendor?admin_id=${admin.id}&month=${selectedMonth}&year=${selectedYear}`)
            if (res.ok) {
                const data = await res.json()
                setDaySummaries(data.days || [])
            }
        } catch (err) {
            console.error('Failed to fetch month summaries:', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }, [admin?.id, selectedMonth, selectedYear])

    // Fetch day details
    const fetchDayOrders = useCallback(async (date: string) => {
        if (!admin?.id) return
        setIsLoadingHistory(true)
        try {
            const res = await fetch(`/api/orders/vendor?admin_id=${admin.id}&date=${date}`)
            if (res.ok) {
                const data = await res.json()
                setDayOrders(data)
            }
        } catch (err) {
            console.error('Failed to fetch day orders:', err)
        } finally {
            setIsLoadingHistory(false)
        }
    }, [admin?.id])

    useEffect(() => {
        if (showHistory) {
            if (selectedDate) {
                fetchDayOrders(selectedDate)
            } else {
                fetchMonthSummaries()
            }
        }
    }, [showHistory, selectedDate, selectedMonth, selectedYear, fetchMonthSummaries, fetchDayOrders])

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

                    {/* Canteen Image Card */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-white">
                                <Camera className="h-5 w-5" />
                                Canteen Photo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Image Preview */}
                            <div className="relative h-40 rounded-xl overflow-hidden bg-slate-700 border border-slate-600">
                                {canteenImageUrl ? (
                                    <img
                                        src={canteenImageUrl}
                                        alt="Canteen preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none'
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-slate-500" />
                                    </div>
                                )}
                            </div>

                            {/* Image URL Input */}
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Image URL</label>
                                <Input
                                    type="url"
                                    placeholder="https://example.com/canteen-photo.jpg"
                                    value={canteenImageUrl}
                                    onChange={(e) => setCanteenImageUrl(e.target.value)}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                                <p className="text-xs text-slate-500">Paste a URL to your canteen photo — this will appear on the student app</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleSaveCanteenImage}
                                    disabled={isSavingImage}
                                    className="gap-2"
                                >
                                    {isSavingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                    Save Photo
                                </Button>
                                {imageSaveMsg && (
                                    <span className={`text-sm ${imageSaveMsg === 'Image saved!' ? 'text-green-400' : 'text-red-400'}`}>
                                        {imageSaveMsg}
                                    </span>
                                )}
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

                    {/* Order History Card */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    {t('orderHistory')}
                                </CardTitle>
                                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                            </button>
                        </CardHeader>

                        {showHistory && (
                            <CardContent className="space-y-4">
                                {/* Year & Month Selectors */}
                                {!selectedDate && (
                                    <div className="flex gap-2">
                                        {/* Year Dropdown */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => setShowYearDropdown(!showYearDropdown)}
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm hover:bg-slate-600 transition-colors"
                                            >
                                                <span className="text-white">{selectedYear}</span>
                                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showYearDropdown && (
                                                <div className="absolute top-full left-0 mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50 py-1">
                                                    {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                                                        <button
                                                            key={year}
                                                            onClick={() => { setSelectedYear(year); setShowYearDropdown(false) }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${selectedYear === year ? 'text-red-400 font-medium' : 'text-slate-300'}`}
                                                        >
                                                            {year}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Month Dropdown */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm hover:bg-slate-600 transition-colors"
                                            >
                                                <span className="text-white">{tOrders(MONTH_KEYS[selectedMonth - 1])}</span>
                                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showMonthDropdown && (
                                                <div className="absolute top-full left-0 mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                                                    {MONTH_KEYS.map((key, idx) => (
                                                        <button
                                                            key={key}
                                                            onClick={() => { setSelectedMonth(idx + 1); setShowMonthDropdown(false) }}
                                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${selectedMonth === idx + 1 ? 'text-red-400 font-medium' : 'text-slate-300'}`}
                                                        >
                                                            {tOrders(key)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Back button for day view */}
                                {selectedDate && (
                                    <button
                                        onClick={() => { setSelectedDate(null); setDayOrders(null) }}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        {t('backToMonthView')}
                                    </button>
                                )}

                                {/* Loading */}
                                {isLoadingHistory && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-500">{tOrders('loadingHistory')}</p>
                                    </div>
                                )}

                                {/* Month View: Day Summaries */}
                                {!isLoadingHistory && !selectedDate && (
                                    <>
                                        {daySummaries.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-slate-400">{t('noOrders')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Monthly total */}
                                                <div className="rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-800/40 p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-slate-400 uppercase">{t('monthlyRevenue')}</p>
                                                            <p className="text-2xl font-bold text-white">
                                                                ₹{daySummaries.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-400 uppercase">{t('totalOrders')}</p>
                                                            <p className="text-2xl font-bold text-white">
                                                                {daySummaries.reduce((sum, d) => sum + d.orderCount, 0)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {daySummaries.map(day => {
                                                    const formatDateHeader = (dateStr: string) => {
                                                        const date = new Date(dateStr + 'T00:00:00')
                                                        return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                                                    }

                                                    return (
                                                        <button
                                                            key={day.date}
                                                            onClick={() => setSelectedDate(day.date)}
                                                            className="w-full rounded-xl bg-slate-700/50 border border-slate-600 p-4 flex items-center justify-between hover:bg-slate-700 hover:border-slate-500 transition-colors text-left"
                                                        >
                                                            <div>
                                                                <p className="font-semibold text-white">{formatDateHeader(day.date)}</p>
                                                                <p className="text-xs text-slate-400">{tOrders('ordersCount', { count: day.orderCount })}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-emerald-400">₹{day.totalRevenue.toLocaleString()}</p>
                                                                <p className="text-xs text-slate-500">{t('viewDetails')} →</p>
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Day View: All orders for a specific date */}
                                {!isLoadingHistory && selectedDate && dayOrders && (
                                    <>
                                        {/* Day revenue header */}
                                        <div className="rounded-xl bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-800/40 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase">{t('dailyRevenue')}</p>
                                                    <p className="text-2xl font-bold text-white">₹{dayOrders.totalRevenue.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-400 uppercase">{t('totalOrders')}</p>
                                                    <p className="text-2xl font-bold text-white">{dayOrders.orderCount}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day's orders */}
                                        <div className="space-y-3">
                                            {dayOrders.orders.map((order: any) => {
                                                const formatTime = (dateString: string) => {
                                                    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                                }

                                                return (
                                                    <div key={order.id} className="rounded-xl bg-slate-700/50 border border-slate-600 p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <p className="font-mono text-lg font-bold text-white">{order.token_number || order.id}</p>
                                                                <p className="text-xs text-slate-500">{formatTime(order.created_at)}</p>
                                                            </div>
                                                            <Badge className="bg-neutral-100 text-neutral-600 border-neutral-200 border gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                {t('completed')}
                                                            </Badge>
                                                        </div>
                                                        <div className="mb-3 space-y-1">
                                                            {order.items.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <span className="text-white">{item.quantity}x {item.name}</span>
                                                                    <span className="text-slate-400">₹{item.price * item.quantity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-600 flex justify-end">
                                                            <span className="font-semibold text-lg text-white">₹{order.total}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}
