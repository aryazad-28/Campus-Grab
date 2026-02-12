'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdminForgotPasswordPage() {
    const { resetPassword } = useAdmin()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const { success, error } = await resetPassword(email)

        if (success) {
            setSent(true)
        } else {
            setError(error || 'Failed to send reset email')
        }

        setIsLoading(false)
    }

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
                <Card className="w-full max-w-sm bg-slate-800 border-slate-700 text-center">
                    <CardContent className="pt-8">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                            <CheckCircle className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-white">Check your email</h2>
                        <p className="mb-6 text-sm text-slate-400">
                            We&apos;ve sent a password reset link to {email}
                        </p>
                        <Link href="/admin/login">
                            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                                Back to login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
                <CardHeader className="text-center">
                    <CardTitle className="text-white text-2xl">Forgot password?</CardTitle>
                    <CardDescription className="text-slate-400">Enter your email to receive a reset link</CardDescription>
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
                                    placeholder="you@example.com"
                                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-400">{error}</p>
                        )}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send reset link'}
                        </Button>
                    </form>

                    <Link href="/admin/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300">
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
