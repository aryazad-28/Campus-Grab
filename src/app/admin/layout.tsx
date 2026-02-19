'use client'

import { AdminProvider, useAdmin } from '@/components/AdminProvider'
import { MenuProvider } from '@/components/MenuProvider'
import { OrdersProvider } from '@/components/OrdersProvider'

function AdminScopedProviders({ children }: { children: React.ReactNode }) {
    const { admin, isLoading } = useAdmin()

    // Prevent fetching data until we know who the admin is
    if (isLoading) return null

    const adminId = admin?.id

    // If not authenticated (admin is null), the page protection will handle redirect, 
    // but we should still avoid fetching "public" data here.
    if (!adminId) return null

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
