'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    id: string
    name: string
    email: string
    phone?: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'campus-grab-user'

// Demo users for prototype
const DEMO_USERS = [
    { id: '1', name: 'Arya', email: 'arya@campus.edu', password: 'demo123', phone: '9876543210' },
    { id: '2', name: 'Student', email: 'student@campus.edu', password: 'demo123', phone: '9876543211' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
            try {
                setUser(JSON.parse(stored))
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY)
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const found = DEMO_USERS.find(u => u.email === email && u.password === password)
        if (found) {
            const { password: _, ...userData } = found
            setUser(userData)
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
