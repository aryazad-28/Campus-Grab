'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AdminProfile {
    id: string
    user_id: string
    name: string
    email: string
    canteen_name: string
    college_name: string
    area: string
    phone: string | null
    latitude: number | null
    longitude: number | null
    status: 'pending' | 'approved' | 'rejected'
    razorpay_key_id: string | null
    razorpay_key_secret: string | null
}

interface AdminContextType {
    admin: AdminProfile | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
    submitOnboarding: (profile: OnboardingData) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    isAuthenticated: boolean
    isPending: boolean
    isRejected: boolean
    needsOnboarding: boolean
}

interface OnboardingData {
    name: string
    canteen_name: string
    college_name: string
    area: string
    phone: string
    latitude?: number | null
    longitude?: number | null
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)
const ADMIN_STORAGE_KEY = 'campus-grab-admin'

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [needsOnboarding, setNeedsOnboarding] = useState(false)
    const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
    const [supabaseEmail, setSupabaseEmail] = useState<string>('')

    const loadAdminProfile = useCallback(async (userId: string, email: string) => {
        if (!supabase) return

        setSupabaseUserId(userId)
        setSupabaseEmail(email)

        // First, check if this user is tagged as an admin
        const { data: { user } } = await supabase.auth.getUser()

        // Check account type metadata
        if (user?.user_metadata?.account_type === 'student') {
            // This is a student account, not an admin - sign out
            await supabase.auth.signOut()
            setAdmin(null)
            setNeedsOnboarding(false)
            setIsLoading(false)
            alert('This account is registered as a student account. Please use the student portal to log in.')
            return
        }

        const { data, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error || !data) {
            setNeedsOnboarding(true)
            setAdmin(null)
            setIsLoading(false)
            return
        }

        setNeedsOnboarding(false)
        setAdmin(data as AdminProfile)
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data))
        setIsLoading(false)
    }, [])

    useEffect(() => {
        if (!supabase) {
            const stored = localStorage.getItem(ADMIN_STORAGE_KEY)
            if (stored) {
                try { setAdmin(JSON.parse(stored)) } catch { localStorage.removeItem(ADMIN_STORAGE_KEY) }
            }
            setIsLoading(false)
            return
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                loadAdminProfile(session.user.id, session.user.email || '')
            } else {
                setIsLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadAdminProfile(session.user.id, session.user.email || '')
            } else {
                setAdmin(null)
                setNeedsOnboarding(false)
                setIsLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [loadAdminProfile])

    const login = useCallback(async (email: string, password: string) => {
        if (!supabase) return { success: false, error: 'Supabase not configured' }
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) return { success: false, error: error.message }
            return { success: true }
        } catch {
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const signUp = useCallback(async (email: string, password: string) => {
        if (!supabase) return { success: false, error: 'Supabase not configured' }
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        account_type: 'admin'  // Tag as admin account
                    },
                    // Disable email confirmation requirement
                    emailRedirectTo: undefined
                }
            })
            if (error) {
                // Better error messages for common issues
                if (error.message.includes('rate limit') || error.message.includes('Email rate limit exceeded')) {
                    return {
                        success: false,
                        error: 'Too many signup attempts. Please wait a few minutes and try again, or disable email confirmation in Supabase Dashboard (Auth → Providers → Email).'
                    }
                }
                return { success: false, error: error.message }
            }
            // Note: If email confirmation is required by Supabase settings and emails aren't being sent,
            // you'll need to disable "Enable email confirmations" in your Supabase dashboard
            // under Authentication > Settings > Email Auth
            if (data.user && !data.session) {
                return { success: true, error: 'Please check your email to verify your account' }
            }
            return { success: true }
        } catch {
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const signInWithGoogle = useCallback(async () => {
        if (!supabase) return { success: false, error: 'Supabase not configured' }
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/admin` }
            })
            if (error) return { success: false, error: error.message }
            return { success: true }
        } catch {
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const resetPassword = useCallback(async (email: string) => {
        if (!supabase) return { success: false, error: 'Supabase not configured' }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/login`
            })
            if (error) return { success: false, error: error.message }
            return { success: true }
        } catch {
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const submitOnboarding = useCallback(async (profile: OnboardingData) => {
        if (!supabase || !supabaseUserId) return { success: false, error: 'Not authenticated' }

        const { data, error } = await supabase.from('admin_profiles').insert({
            user_id: supabaseUserId,
            email: supabaseEmail,
            name: profile.name,
            canteen_name: profile.canteen_name,
            college_name: profile.college_name,
            area: profile.area,
            phone: profile.phone || null,
            latitude: profile.latitude || null,
            longitude: profile.longitude || null,
            status: 'pending'
        }).select().single()

        if (error) return { success: false, error: error.message }

        setAdmin(data as AdminProfile)
        setNeedsOnboarding(false)
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data))
        return { success: true }
    }, [supabaseUserId, supabaseEmail])

    const logout = useCallback(() => {
        if (supabase) supabase.auth.signOut()
        setAdmin(null)
        setNeedsOnboarding(false)
        setSupabaseUserId(null)
        localStorage.removeItem(ADMIN_STORAGE_KEY)
    }, [])

    return (
        <AdminContext.Provider value={{
            admin,
            isLoading,
            login,
            signUp,
            signInWithGoogle,
            resetPassword,
            submitOnboarding,
            logout,
            isAuthenticated: !!admin && admin.status === 'approved',
            isPending: !!admin && admin.status === 'pending',
            isRejected: !!admin && admin.status === 'rejected',
            needsOnboarding,
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    const context = useContext(AdminContext)
    if (!context) throw new Error('useAdmin must be used within an AdminProvider')
    return context
}
