'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
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
            <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
                <Card className="w-full max-w-sm text-center">
                    <CardContent className="pt-8">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
                        <p className="mb-6 text-sm text-neutral-500">
                            We&apos;ve sent a password reset link to {email}
                        </p>
                        <Link href="/login">
                            <Button variant="outline" className="w-full">
                                Back to login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Forgot password?</CardTitle>
                    <CardDescription>Enter your email to receive a reset link</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send reset link'}
                        </Button>
                    </form>

                    <Link href="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-900">
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
