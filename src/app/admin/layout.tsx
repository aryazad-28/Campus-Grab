'use client'

import { AdminProvider, useAdmin } from '@/components/AdminProvider'
import { MenuProvider } from '@/components/MenuProvider'
import { OrdersProvider } from '@/components/OrdersProvider'

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
                {children}
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
        <AdminProvider>
            <AdminScopedProviders>
                {children}
            </AdminScopedProviders>
        </AdminProvider>
    )
}
