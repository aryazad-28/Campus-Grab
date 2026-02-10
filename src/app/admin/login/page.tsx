'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ShieldCheck } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdminLoginPage() {
    const router = useRouter()
    const { login, isAuthenticated } = useAdmin()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    if (isAuthenticated) {
        router.push('/admin')
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const success = await login(email, password)

        if (success) {
            router.push('/admin')
        } else {
            setError('Invalid admin credentials')
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
                <CardHeader className="text-center">
                    <Link
                        href="/login"
                        className="text-xs text-slate-500 hover:text-white mb-2 inline-block"
                    >
                        ← Back to role selection
                    </Link>
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">Canteen Admin</CardTitle>
                    <CardDescription className="text-slate-400">Sign in to manage orders</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300" htmlFor="email">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@campus.edu"
                                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 rounded-lg bg-slate-700/50 p-3">
                        <p className="text-xs text-slate-400 mb-1">Demo credentials:</p>
                        <p className="text-xs font-mono text-slate-300">admin@campus.edu / admin123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
