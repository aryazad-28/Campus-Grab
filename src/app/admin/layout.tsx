'use client'

import { AdminProvider, useAdmin } from '@/components/AdminProvider'
import { MenuProvider } from '@/components/MenuProvider'
import { OrdersProvider } from '@/components/OrdersProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AdminHeader } from '@/components/AdminHeader'
import { AdminBottomNav } from '@/components/AdminBottomNav'

function AdminScopedProviders({ children }: { children: React.ReactNode }) {
    const { admin, isLoading } = useAdmin()

    // Prevent fetching data until we know who the admin is
    if (isLoading) return null

    const adminId = admin?.id

    // If not authenticated (admin is null), return children unwrapped so login/onboarding pages can render,
    // without spinning up the MenuProvider/OrdersProvider that require an adminId.
    if (!adminId) return <>{children}</>

    return (
        <MenuProvider adminId={adminId}>
            <OrdersProvider adminId={adminId}>
                <AdminHeader />
                <main className="min-h-[calc(100vh-4rem)] pb-20 sm:pb-8">
                    {children}
                </main>
                <AdminBottomNav />
            </OrdersProvider>
        </MenuProvider>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider>
            <AdminProvider>
                <AdminScopedProviders>
                    {children}
                </AdminScopedProviders>
            </AdminProvider>
        </ThemeProvider>
    )
}
