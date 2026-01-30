'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, User, Loader2, GraduationCap, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useAdmin } from '@/components/AdminProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type AuthMode = 'signin' | 'signup'
type UserRole = 'student' | 'admin'

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
    const { login: adminLogin, isAuthenticated: isAdminAuthenticated } = useAdmin()

    const [role, setRole] = useState<UserRole | null>(null)
    const [mode, setMode] = useState<AuthMode>('signin')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    // Redirect if already logged in
    if (isAuthenticated) {
        router.push('/menu')
        return null
    }
    if (isAdminAuthenticated) {
        router.push('/admin')
        return null
    }

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

    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        setIsLoading(true)

        const success = await adminLogin(email, password)

        if (success) {
            router.push('/admin')
        } else {
            setMessage({ type: 'error', text: 'Invalid admin credentials' })
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
    if (!role) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-neutral-50 dark:bg-neutral-900">
                {/* Brand Header with Logo */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <img
                            src="/logo.png"
                            alt="Campus Grab"
                            className="h-14 w-14 rounded-2xl shadow-lg"
                        />
                        <h1 className="text-4xl font-bold tracking-tight text-white">Campus Grab</h1>
                    </div>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400">
                        Skip the queue. Grab your food faster.
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="w-full max-w-md space-y-4">
                    <p className="text-center text-sm text-neutral-500 mb-4">Continue as</p>

                    <button
                        onClick={() => setRole('student')}
                        className="w-full p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-900 dark:hover:border-white transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-semibold">Student</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Order food from campus canteens
                                </p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => setRole('admin')}
                        className="w-full p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-900 dark:hover:border-white transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-semibold">Canteen Admin</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Manage orders and menu items
                                </p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            </div>
        )
    }

    // Student Login
    if (role === 'student') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-neutral-50 dark:bg-neutral-900">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <img
                            src="/logo.png"
                            alt="Campus Grab"
                            className="h-10 w-10 rounded-xl"
                        />
                        <h1 className="text-3xl font-bold tracking-tight text-white">Campus Grab</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">Skip the queue. Grab your food faster.</p>
                </div>

                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <button
                            onClick={() => setRole(null)}
                            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
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
                                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-neutral-800 px-2 text-neutral-500">or</span>
                            </div>
                        </div>

                        <form onSubmit={handleStudentSubmit} className="space-y-4">
                            {mode === 'signup' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium" htmlFor="name">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="password">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
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
                                    <Link href="/forgot-password" className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
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
                                        className="font-medium underline"
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
                                        className="font-medium underline"
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

    // Admin Login
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-slate-900">
            {/* Brand Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <img
                        src="/logo.png"
                        alt="Campus Grab"
                        className="h-10 w-10 rounded-xl"
                    />
                    <h1 className="text-3xl font-bold tracking-tight text-white">Campus Grab</h1>
                </div>
                <p className="text-slate-400">Canteen Management Portal</p>
            </div>

            <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
                <CardHeader className="text-center">
                    <button
                        onClick={() => setRole(null)}
                        className="text-xs text-slate-500 hover:text-white mb-2"
                    >
                        ← Back to role selection
                    </button>
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">Canteen Admin</CardTitle>
                    <CardDescription className="text-slate-400">Sign in to manage orders</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300" htmlFor="admin-email">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="admin-email"
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
                            <label className="text-sm font-medium text-slate-300" htmlFor="admin-password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                <Input
                                    id="admin-password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {message && (
                            <p className="text-sm text-red-400">{message.text}</p>
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
