'use client'

import { AdminProvider, useAdmin } from '@/components/AdminProvider'
import { MenuProvider } from '@/components/MenuProvider'
import { OrdersProvider } from '@/components/OrdersProvider'

function AdminScopedProviders({ children }: { children: React.ReactNode }) {
    const { admin } = useAdmin()
    const adminId = admin?.id

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
