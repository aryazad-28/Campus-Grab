'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import { useAdmin } from '@/components/AdminProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AdminLoginPage() {
    const router = useRouter()
    const { login, signUp, signInWithGoogle, isAuthenticated, isPending, needsOnboarding, isLoading: authLoading } = useAdmin()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    // Redirect based on state
    if (!authLoading) {
        if (isAuthenticated) {
            router.push('/admin')
            return null
        }
        if (needsOnboarding) {
            router.push('/admin/onboarding')
            return null
        }
        if (isPending) {
            router.push('/admin/onboarding')
            return null
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setInfo('')
        setIsLoading(true)

        if (isSignUp) {
            const { success, error } = await signUp(email, password)
            if (success) {
                if (error) {
                    setInfo(error) // "Check your email" message
                }
            } else {
                setError(error || 'Sign up failed')
            }
        } else {
            const { success, error } = await login(email, password)
            if (!success) {
                setError(error || 'Invalid credentials')
            }
        }

        setIsLoading(false)
    }

    const handleGoogleSignIn = async () => {
        setError('')
        const { success, error } = await signInWithGoogle()
        if (!success) {
            setError(error || 'Google sign-in failed')
        }
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
                    <CardDescription className="text-slate-400">
                        {isSignUp ? 'Create your admin account' : 'Sign in to manage orders'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Google Sign-In */}
                    <Button
                        variant="outline"
                        className="w-full mb-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={handleGoogleSignIn}
                    >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-slate-800 px-2 text-slate-500">or</span>
                        </div>
                    </div>

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
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}
                        {info && <p className="text-sm text-blue-400">{info}</p>}

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {isSignUp ? 'Creating...' : 'Signing in...'}</>
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 space-y-2 text-center">
                        <Link href="/admin/forgot-password" className="text-xs text-slate-500 hover:text-slate-300 block">
                            Forgot password?
                        </Link>
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); setInfo('') }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : 'New admin? Create an account'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
