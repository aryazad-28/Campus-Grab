'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    UserCircle,
    Building,
    MapPin,
    Phone,
    Mail,
    Loader2,
    LogOut,
    History,
    ChevronDown,
    CheckCircle,
    Camera,
    ImageIcon,
    Globe,
    HelpCircle,
    Shield,
    Receipt,
    Info,
    ChevronRight
} from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

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

const ProfileRow = ({
    icon: Icon,
    label,
    value,
    onClick,
    className = '',
    chevron = true,
}: {
    icon: any
    label: string
    value?: React.ReactNode
    onClick?: () => void
    className?: string
    chevron?: boolean
}) => (
    <button
        onClick={onClick}
        disabled={!onClick}
        className={cn(
            "w-full flex items-center justify-between p-4 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors text-left",
            !onClick && "cursor-default hover:bg-[var(--card)] hover:text-inherit",
            className
        )}
    >
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium text-[var(--foreground)] text-sm sm:text-base">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {value && <span className="text-sm font-medium text-[var(--muted-foreground)]">{value}</span>}
            {onClick && chevron && <ChevronRight className="h-5 w-5 text-[var(--muted-foreground)] opacity-50" />}
        </div>
    </button>
)

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
    const fileInputRef = (typeof window !== 'undefined') ? { current: null as HTMLInputElement | null } : { current: null }

    useEffect(() => {
        if (admin?.canteen_image) setCanteenImageUrl(admin.canteen_image)
    }, [admin])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !admin || !supabase) return

        if (!file.type.startsWith('image/')) {
            setImageSaveMsg('Please select an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageSaveMsg('Image must be under 5MB')
            return
        }

        setIsSavingImage(true)
        setImageSaveMsg(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${admin.id}/canteen.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('canteen-images')
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('canteen-images')
                .getPublicUrl(fileName)

            const publicUrl = urlData.publicUrl

            const { error: updateError } = await supabase
                .from('admin_profiles')
                .update({ canteen_image: publicUrl })
                .eq('id', admin.id)

            if (updateError) throw updateError

            setCanteenImageUrl(publicUrl)
            setImageSaveMsg('Photo uploaded!')
            setTimeout(() => setImageSaveMsg(null), 3000)
        } catch (err: any) {
            setImageSaveMsg(err.message || 'Upload failed')
        }
        setIsSavingImage(false)

        if (e.target) e.target.value = ''
    }

    const handleRemoveImage = async () => {
        if (!admin || !supabase) return
        setIsSavingImage(true)
        try {
            await supabase
                .from('admin_profiles')
                .update({ canteen_image: null })
                .eq('id', admin.id)
            setCanteenImageUrl('')
            setImageSaveMsg('Photo removed')
            setTimeout(() => setImageSaveMsg(null), 3000)
        } catch {
            setImageSaveMsg('Failed to remove')
        }
        setIsSavingImage(false)
    }

    // Fetch month summaries
    const fetchMonthSummaries = useCallback(async () => {
        if (!admin?.id) return
        setIsLoadingHistory(true)
        try {
            const session = supabase ? (await supabase.auth.getSession()).data.session : null
            const headers: Record<string, string> = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch(`/api/orders/vendor?admin_id=${admin.id}&month=${selectedMonth}&year=${selectedYear}`, { headers })
            if (res.ok) {
                const data = await res.json()
                setDaySummaries(data.days || [])
            }
        } catch {
            // Failed to fetch silently
        } finally {
            setIsLoadingHistory(false)
        }
    }, [admin?.id, selectedMonth, selectedYear])

    // Fetch day details
    const fetchDayOrders = useCallback(async (date: string) => {
        if (!admin?.id) return
        setIsLoadingHistory(true)
        try {
            const session = supabase ? (await supabase.auth.getSession()).data.session : null
            const headers: Record<string, string> = {}
            if (session?.access_token) {
                headers['Authorization'] = `Bearer ${session.access_token}`
            }

            const res = await fetch(`/api/orders/vendor?admin_id=${admin.id}&date=${date}`, { headers })
            if (res.ok) {
                const data = await res.json()
                setDayOrders(data)
            }
        } catch {
            // Failed to fetch silently
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        setTimeout(() => router.push('/login'), 100)
    }

    return (
        <div className="animate-in fade-in pb-20 bg-[var(--background)]">
            {/* Header */}
            <header className="sticky top-[4rem] z-40 border-b glass bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold">{t('profile')}</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">

                {/* Account Details Group */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2">
                        Account Details
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                        
                        <div className="p-6 border-b border-[var(--border)] flex flex-col items-center justify-center text-center gap-3">
                            <div className="h-20 w-20 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center ring-4 ring-blue-500/5">
                                <UserCircle className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--foreground)]">{admin?.name}</h3>
                                <p className="text-sm font-medium text-[var(--muted-foreground)]">{admin?.email}</p>
                            </div>
                        </div>

                        <ProfileRow icon={Building} label="Canteen Name" value={admin?.canteen_name} />
                        <div className="h-px w-full bg-[var(--border)]" />
                        <ProfileRow icon={MapPin} label="College" value={admin?.college_name} />
                        <div className="h-px w-full bg-[var(--border)]" />
                        <ProfileRow icon={Phone} label="Phone" value={admin?.phone || '-'} />
                    </div>
                </div>

                {/* Canteen Photo Group */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2">
                        Appearance
                    </h2>
                    <Card className="rounded-2xl border-[var(--border)] shadow-sm">
                        <CardContent className="p-4 sm:p-6 space-y-5">
                            <div className="relative h-48 rounded-xl overflow-hidden bg-[var(--muted)] border border-[var(--border)] shadow-inner">
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
                                    <div className="flex h-full flex-col items-center justify-center gap-3">
                                        <div className="p-3 bg-background rounded-full shadow-sm">
                                            <ImageIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
                                        </div>
                                        <p className="text-sm font-medium text-[var(--muted-foreground)]">No photo yet</p>
                                    </div>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { fileInputRef.current = el }}
                                onChange={handleImageUpload}
                            />

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSavingImage}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                                >
                                    {isSavingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                    {canteenImageUrl ? 'Change Photo' : 'Upload Photo'}
                                </Button>
                                {canteenImageUrl && (
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveImage}
                                        disabled={isSavingImage}
                                        className="w-full sm:w-auto gap-2 border-[var(--border)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 font-medium"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            {imageSaveMsg && (
                                <p className={`text-sm font-medium px-1 ${imageSaveMsg.includes('uploaded') || imageSaveMsg.includes('removed') ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {imageSaveMsg}
                                </p>
                            )}
                            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed px-1">Upload a photo of your canteen to attract more students. Maximum size is 5MB.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Settings & Support Group */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2">
                        Settings & Support
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                        <ProfileRow 
                            icon={Globe} 
                            label="Language" 
                            value={<LanguageSwitcher />} 
                            chevron={false}
                        />
                        <div className="h-px w-full bg-[var(--border)]" />
                        <Link href="/admin/support">
                            <ProfileRow icon={HelpCircle} label="Help & Support" />
                        </Link>
                    </div>
                </div>

                {/* Orders History Group */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2">
                        Records
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex items-center justify-between p-4 bg-[var(--card)] hover:bg-[var(--accent)] transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                                    <History className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-[var(--foreground)] text-sm sm:text-base">Order History</span>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-[var(--muted-foreground)] transition-transform duration-300 ${showHistory ? '-rotate-180' : ''}`} />
                        </button>

                        {/* Order History Accordion Content */}
                        {showHistory && (
                            <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
                                {/* Year & Month Selectors */}
                                {!selectedDate && (
                                    <div className="flex gap-2 mb-4">
                                        {/* Year Dropdown */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => setShowYearDropdown(!showYearDropdown)}
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors"
                                            >
                                                <span>{selectedYear}</span>
                                                <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showYearDropdown && (
                                                <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-lg z-50 py-1 overflow-hidden">
                                                    {[selectedYear - 1, selectedYear, selectedYear + 1].map(year => (
                                                        <button
                                                            key={year}
                                                            onClick={() => { setSelectedYear(year); setShowYearDropdown(false) }}
                                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--accent)] transition-colors ${selectedYear === year ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' : 'font-medium'}`}
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
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors"
                                            >
                                                <span>{tOrders(MONTH_KEYS[selectedMonth - 1])}</span>
                                                <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showMonthDropdown && (
                                                <div className="absolute top-full right-0 lg:left-0 mt-2 w-48 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                                                    {MONTH_KEYS.map((key, idx) => (
                                                        <button
                                                            key={key}
                                                            onClick={() => { setSelectedMonth(idx + 1); setShowMonthDropdown(false) }}
                                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--accent)] transition-colors ${selectedMonth === idx + 1 ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' : 'font-medium'}`}
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
                                        className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm font-medium mb-4"
                                    >
                                        <ChevronDown className="h-4 w-4 rotate-90" />
                                        {t('backToMonthView')}
                                    </button>
                                )}

                                {/* Loading */}
                                {isLoadingHistory && (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                                        <p className="text-sm font-medium text-[var(--muted-foreground)]">{tOrders('loadingHistory')}</p>
                                    </div>
                                )}

                                {/* Month View: Day Summaries */}
                                {!isLoadingHistory && !selectedDate && (
                                    <>
                                        {daySummaries.length === 0 ? (
                                            <div className="text-center py-12 rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/50">
                                                <p className="font-medium text-[var(--muted-foreground)]">{t('noOrders')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Monthly total */}
                                                <div className="rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 p-5">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/80 uppercase tracking-wider mb-1">{t('monthlyRevenue')}</p>
                                                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                                                                ₹{daySummaries.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/80 uppercase tracking-wider mb-1">{t('totalOrders')}</p>
                                                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                                                                {daySummaries.reduce((sum, d) => sum + d.orderCount, 0)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 mt-4">
                                                    {daySummaries.map(day => {
                                                        const formatDateHeader = (dateStr: string) => {
                                                            const date = new Date(dateStr + 'T00:00:00')
                                                            return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                                                        }

                                                        return (
                                                            <button
                                                                key={day.date}
                                                                onClick={() => setSelectedDate(day.date)}
                                                                className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] p-4 flex items-center justify-between hover:bg-[var(--accent)] hover:border-[var(--ring)] transition-all text-left shadow-sm group"
                                                            >
                                                                <div>
                                                                    <p className="font-bold text-[var(--foreground)]">{formatDateHeader(day.date)}</p>
                                                                    <p className="text-sm font-medium text-[var(--muted-foreground)] mt-0.5">{tOrders('ordersCount', { count: day.orderCount })}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-emerald-600 dark:text-emerald-500">₹{day.totalRevenue.toLocaleString()}</p>
                                                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">View Details →</p>
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Day View: All orders for a specific date */}
                                {!isLoadingHistory && selectedDate && dayOrders && (
                                    <>
                                        {/* Day revenue header */}
                                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 p-5 mb-5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/80 uppercase tracking-wider mb-1">{t('dailyRevenue')}</p>
                                                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{dayOrders.totalRevenue.toLocaleString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/80 uppercase tracking-wider mb-1">{t('totalOrders')}</p>
                                                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{dayOrders.orderCount}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day's orders */}
                                        <div className="space-y-4">
                                            {dayOrders.orders.map((order: any) => {
                                                const formatTime = (dateString: string) => {
                                                    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                                }

                                                return (
                                                    <div key={order.id} className="rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                                                        <div className="p-4 bg-[var(--muted)]/30 border-b border-[var(--border)] flex items-start justify-between rounded-t-xl">
                                                            <div>
                                                                <p className="font-mono text-lg font-bold">#{order.token_number || order.id.slice(0, 4)}</p>
                                                                <p className="text-xs font-medium text-[var(--muted-foreground)] mt-0.5">{formatTime(order.created_at)}</p>
                                                            </div>
                                                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 gap-1 font-semibold shadow-none">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Completed
                                                            </Badge>
                                                        </div>
                                                        <div className="p-4 space-y-2.5">
                                                            {order.items.map((item: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between text-sm">
                                                                    <span className="font-medium">{item.quantity}x {item.name}</span>
                                                                    <span className="text-[var(--muted-foreground)] font-medium">₹{item.price * item.quantity}</span>
                                                                </div>
                                                            ))}
                                                            <div className="pt-3 mt-3 border-t border-dashed border-[var(--border)] flex justify-between items-center">
                                                                <span className="font-semibold text-[var(--muted-foreground)]">Total</span>
                                                                <span className="font-black text-lg text-[var(--foreground)]">₹{order.total}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Legal Group */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)] px-2">
                        Legal
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                        <Link href="/admin/terms">
                            <ProfileRow icon={Receipt} label="Terms & Conditions" />
                        </Link>
                        <div className="h-px w-full bg-[var(--border)]" />
                        <Link href="/admin/privacy">
                            <ProfileRow icon={Shield} label="Privacy Policy" />
                        </Link>
                        <div className="h-px w-full bg-[var(--border)]" />
                        <Link href="/admin/refund">
                            <ProfileRow icon={Receipt} label="Refund Policy" />
                        </Link>
                        <div className="h-px w-full bg-[var(--border)]" />
                        <Link href="/admin/about">
                            <ProfileRow icon={Info} label="About Campus Grab" />
                        </Link>
                    </div>
                </div>

                {/* Sign Out */}
                <Button 
                    variant="destructive" 
                    className="w-full h-14 rounded-2xl text-base font-bold gap-3 shadow-lg shadow-red-500/20 mt-8 mb-4"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </Button>

            </main>
        </div>
    )
}
