'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, UtensilsCrossed, LogOut, Plus } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
    const router = useRouter()
    const { admin, isAuthenticated, isLoading, logout } = useAdmin()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/admin/login')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-neutral-500">Loading...</p>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        router.push('/admin/login')
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-6 w-6" />
                        <span className="text-lg font-semibold">Admin Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-500">{admin?.name}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <h1 className="mb-6 text-2xl font-semibold">Welcome, {admin?.name}</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Menu Management Card */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UtensilsCrossed className="h-5 w-5" />
                                Menu Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-neutral-500 mb-4">
                                Add, edit, or remove menu items. Changes sync instantly to all students.
                            </p>
                            <Link href="/admin/menu">
                                <Button className="w-full gap-2">
                                    <Plus className="h-4 w-4" />
                                    Manage Menu
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-neutral-500">Total Items</span>
                                <span className="font-medium">--</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-neutral-500">Categories</span>
                                <span className="font-medium">--</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-neutral-500">Available</span>
                                <span className="font-medium">--</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* View Student App */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Student App</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-neutral-500 mb-4">
                                Preview what students see on the menu page.
                            </p>
                            <Link href="/menu" target="_blank">
                                <Button variant="outline" className="w-full">
                                    Open Student View
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
