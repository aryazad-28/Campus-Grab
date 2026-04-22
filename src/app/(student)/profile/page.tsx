'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User, Mail, LogOut, Clock, ChevronRight,
    HelpCircle, Bug, Phone, FileText, Shield,
    RotateCcw, Info, Globe, Gift, Star
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useOrders } from '@/components/OrdersProvider'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useRewards } from '@/components/RewardsProvider'

/* ─── Reusable row component for menu-style items ─── */
function ProfileRow({
    icon: Icon,
    label,
    sublabel,
    href,
    iconColor = 'var(--muted-foreground)',
    showArrow = true,
    onClick,
    rightElement,
}: {
    icon: React.ElementType
    label: string
    sublabel?: string
    href?: string
    iconColor?: string
    showArrow?: boolean
    onClick?: () => void
    rightElement?: React.ReactNode
}) {
    const content = (
        <div className="flex items-center gap-3.5 px-4 min-h-[52px] py-3 transition-colors">
            <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--card-elevated)' }}
            >
                <Icon className="h-[18px] w-[18px]" style={{ color: iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{label}</p>
                {sublabel && (
                    <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{sublabel}</p>
                )}
            </div>
            {rightElement}
            {showArrow && !rightElement && (
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
            )}
        </div>
    )

    if (href) {
        return <Link href={href} className="block">{content}</Link>
    }
    if (onClick) {
        return <button onClick={onClick} className="w-full text-left">{content}</button>
    }
    return content
}

function Divider() {
    return <div className="mx-4" style={{ borderTop: '1px solid var(--border)' }} />
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-wider px-4 pt-6 pb-2" style={{ color: 'var(--muted-foreground)' }}>
            {children}
        </p>
    )
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, signOut, isAuthenticated, isLoading } = useAuth()
    const { orders } = useOrders()
    const { rewards } = useRewards()
    const t = useTranslations('Profile')
    const tCommon = useTranslations('Common')

    if (isLoading) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <p style={{ color: 'var(--muted-foreground)' }}>{tCommon('loading')}</p>
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
        <div className="container mx-auto max-w-lg px-4 py-6 pb-32">
            {/* ─── Profile Header ─── */}
            <div className="mb-2 text-center animate-fade-in-up">
                <div
                    className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--card-elevated)' }}
                >
                    <User className="h-10 w-10" style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                    {user?.name}
                </h1>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {user?.email}
                </p>
            </div>

            {/* ─── Account ─── */}
            <SectionTitle>Account</SectionTitle>
            <div
                className="rounded-2xl overflow-hidden animate-fade-in-up delay-1"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <ProfileRow
                    icon={Mail}
                    label="Email"
                    sublabel={user?.email || ''}
                    showArrow={false}
                    iconColor="#6366f1"
                />
                <Divider />
                <ProfileRow
                    icon={Globe}
                    label={t('language')}
                    iconColor="#f59e0b"
                    showArrow={false}
                    rightElement={<LanguageSwitcher />}
                />
            </div>

            {/* ─── Rewards ─── */}
            <SectionTitle>Rewards</SectionTitle>
            <div
                className="rounded-2xl overflow-hidden animate-fade-in-up delay-1"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="flex h-9 w-9 items-center justify-center rounded-xl"
                                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
                            >
                                <Gift className="h-[18px] w-[18px] text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">My Points</p>
                                <p className="text-xs font-semibold text-emerald-600">
                                    {(rewards?.balance ?? 0) >= 2000 ? 'Free Meal Unlocked!' : 'Keep earning!'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">{rewards?.balance ?? 0}</p>
                            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>total pts</p>
                        </div>
                    </div>

                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 mb-1.5 overflow-hidden">
                        <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, ((rewards?.balance ?? 0) / 2000) * 100)}%` }} 
                        />
                    </div>
                    <p className="text-[10px] text-center" style={{ color: 'var(--muted-foreground)' }}>
                        {(rewards?.balance ?? 0) >= 2000 
                            ? 'You have enough points to redeem a full meal!' 
                            : `${2000 - (rewards?.balance ?? 0)} points until free meal unlock`}
                    </p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)' }} />
                <ProfileRow
                    icon={Gift}
                    label="View Rewards & History"
                    sublabel="Streaks, transactions, how it works"
                    href="/rewards"
                    iconColor="#f59e0b"
                />
            </div>

            {/* ─── Recent Orders ─── */}
            <SectionTitle>Orders</SectionTitle>
            <div
                className="rounded-2xl overflow-hidden animate-fade-in-up delay-2"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <ProfileRow
                    icon={Clock}
                    label={t('recentOrders')}
                    sublabel={recentOrders.length > 0
                        ? `${recentOrders.length} recent order${recentOrders.length !== 1 ? 's' : ''}`
                        : 'No orders yet'}
                    href="/orders"
                    iconColor="#22c55e"
                />
                {recentOrders.length > 0 && (
                    <>
                        <Divider />
                        <div className="px-4 py-3 space-y-2">
                            {recentOrders.map(order => (
                                <Link
                                    key={order.id}
                                    href="/orders"
                                    className="flex items-center justify-between rounded-lg p-2.5 transition-colors"
                                    style={{ backgroundColor: 'var(--card-elevated)' }}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-mono font-medium truncate">
                                            {order.token_number || order.id}
                                        </p>
                                        <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{order.total}
                                        </p>
                                    </div>
                                    <span
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: order.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: order.status === 'completed' ? '#22c55e' : '#f59e0b',
                                        }}
                                    >
                                        {order.status === 'completed' ? 'Completed' : order.status === 'ready' ? 'Ready' : order.status === 'preparing' ? 'Preparing' : 'Pending'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ─── Support & Help ─── */}
            <SectionTitle>Support</SectionTitle>
            <div
                className="rounded-2xl overflow-hidden animate-fade-in-up delay-3"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <ProfileRow
                    icon={HelpCircle}
                    label="Help & Support"
                    sublabel="FAQs, report issues, and contact"
                    href="/support"
                    iconColor="#3b82f6"
                />
            </div>

            {/* ─── Legal ─── */}
            <SectionTitle>Legal</SectionTitle>
            <div
                className="rounded-2xl overflow-hidden animate-fade-in-up delay-4"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <ProfileRow
                    icon={FileText}
                    label="Terms & Conditions"
                    href="/terms"
                    iconColor="var(--muted-foreground)"
                />
                <Divider />
                <ProfileRow
                    icon={Shield}
                    label="Privacy Policy"
                    href="/privacy"
                    iconColor="var(--muted-foreground)"
                />
                <Divider />
                <ProfileRow
                    icon={RotateCcw}
                    label="Refund Policy"
                    href="/refund"
                    iconColor="var(--muted-foreground)"
                />
            </div>

            {/* ─── App Info ─── */}
            <SectionTitle>About</SectionTitle>
            <div
                className="rounded-2xl overflow-hidden animate-fade-in-up delay-5"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <ProfileRow
                    icon={Info}
                    label="About Campus Grab"
                    sublabel="Skip the queue. Grab your food faster."
                    href="/about"
                    iconColor="#ef4444"
                />
                <Divider />
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>App Version</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--card-elevated)', color: 'var(--muted-foreground)' }}>
                        v1.0.0
                    </span>
                </div>
            </div>

            {/* ─── Logout ─── */}
            <div className="mt-8 animate-fade-in-up delay-6">
                <Button
                    variant="outline"
                    className="w-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    onClick={handleLogout}
                    style={{ borderColor: 'var(--border)' }}
                >
                    <LogOut className="h-4 w-4" />
                    {tCommon('signOut')}
                </Button>
            </div>
        </div>
    )
}
