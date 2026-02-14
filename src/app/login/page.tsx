'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, User, Loader2, GraduationCap, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type AuthMode = 'signin' | 'signup'

// Google Icon Component
function GoogleIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    )
}

export default function LoginPage() {
    const router = useRouter()
    const { signIn, signUp, signInWithGoogle, isAuthenticated } = useAuth()

    const [mode, setMode] = useState<AuthMode>('signin')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [showStudentForm, setShowStudentForm] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/menu')
        }
    }, [isAuthenticated, router])

    if (isAuthenticated) return null

    const handleStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setIsLoading(true)

        if (mode === 'signup') {
            const { success, error } = await signUp(email, password, name)
            if (success) {
                if (error) {
                    setMessage({ type: 'success', text: error })
                } else {
                    router.push('/menu')
                }
            } else {
                setMessage({ type: 'error', text: error || 'Sign up failed' })
            }
        } else {
            const { success, error } = await signIn(email, password)
            if (success) {
                router.push('/menu')
            } else {
                setMessage({ type: 'error', text: error || 'Sign in failed' })
            }
        }

        setIsLoading(false)
    }

    const handleGoogleSignIn = async () => {
        setMessage(null)
        setIsGoogleLoading(true)

        const { success, error } = await signInWithGoogle()

        if (!success) {
            setMessage({ type: 'error', text: error || 'Google sign in failed' })
            setIsGoogleLoading(false)
        }
    }

    // Role Selection Screen
    if (!showStudentForm) {
        return (
            <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
                {/* Gradient Mesh Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-indigo-50 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#1a0a0a]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-400/10 dark:bg-red-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/10 dark:bg-indigo-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                {/* Content */}
                <div className="relative z-10 text-center mb-10 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <img
                            src="/logo.png"
                            alt="Campus Grab"
                            className="h-14 w-14 rounded-2xl shadow-lg"
                        />
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#991B1B] to-[#DC2626] bg-clip-text text-transparent">
                            Campus Grab
                        </h1>
                    </div>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Skip the queue. Grab your food faster.
                    </p>
                </div>

                <div className="relative z-10 w-full max-w-md space-y-4">
                    <p className="text-center text-sm text-slate-500 mb-4 animate-fade-in-up delay-1">Continue as</p>

                    <button
                        onClick={() => setShowStudentForm(true)}
                        className="w-full p-6 rounded-2xl border-2 border-slate-200 dark:border-[#2D2D2D] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm hover:border-red-400 dark:hover:border-red-800 hover:shadow-lg transition-all duration-300 group animate-fade-in-up delay-2"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-semibold">Student</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Order food from campus canteens
                                </p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-red-500 transition-all" />
                        </div>
                    </button>

                    <button
                        onClick={() => router.push('/admin/login')}
                        className="w-full p-6 rounded-2xl border-2 border-slate-200 dark:border-[#2D2D2D] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-300 group animate-fade-in-up delay-3"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-semibold">Canteen Admin</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Manage orders and menu items
                                </p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all" />
                        </div>
                    </button>
                </div>
            </div>
        )
    }

    // Student Login Form
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
            {/* Gradient Mesh Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-slate-50 dark:from-[#0F0F0F] dark:via-[#0F0F0F] dark:to-[#1a0a0a]" />
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-400/10 dark:bg-red-900/10 rounded-full blur-3xl -translate-y-1/3" />

            {/* Brand Header */}
            <div className="relative z-10 text-center mb-8 animate-fade-in-up">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <img
                        src="/logo.png"
                        alt="Campus Grab"
                        className="h-10 w-10 rounded-xl"
                    />
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#991B1B] to-[#DC2626] bg-clip-text text-transparent">
                        Campus Grab
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400">Skip the queue. Grab your food faster.</p>
            </div>

            <Card className="relative z-10 w-full max-w-sm bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm border-slate-200 dark:border-[#2D2D2D] animate-fade-in-up delay-1">
                <CardHeader className="text-center">
                    <button
                        onClick={() => setShowStudentForm(false)}
                        className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 mb-2 transition-colors"
                    >
                        ← Back to role selection
                    </button>
                    <CardTitle className="text-2xl">
                        {mode === 'signin' ? 'Welcome back' : 'Create account'}
                    </CardTitle>
                    <CardDescription>
                        {mode === 'signin' ? 'Sign in as Student' : 'Sign up as Student'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Google Sign In Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-3 mb-4"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-[#2D2D2D]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#1A1A1A] px-2 text-slate-500">or</span>
                        </div>
                    </div>

                    <form onSubmit={handleStudentSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="name">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Your name"
                                        className="pl-10"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={mode === 'signup'}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            {mode === 'signin' && (
                                <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        {message && (
                            <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                                {message.text}
                            </p>
                        )}

                        <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                            {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        {mode === 'signin' ? (
                            <>
                                Don&apos;t have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setMode('signup'); setMessage(null) }}
                                    className="font-medium text-red-600 dark:text-red-400 underline hover:no-underline"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => { setMode('signin'); setMessage(null) }}
                                    className="font-medium text-red-600 dark:text-red-400 underline hover:no-underline"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
