'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminUser {
    id: string
    name: string
    email: string
    role: 'admin'
}

interface AdminContextType {
    admin: AdminUser | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const ADMIN_STORAGE_KEY = 'campus-grab-admin'

// Demo admin users
const ADMIN_USERS = [
    { id: 'admin1', name: 'Canteen Admin', email: 'admin@campus.edu', password: 'admin123', role: 'admin' as const },
]

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem(ADMIN_STORAGE_KEY)
        if (stored) {
            try {
                setAdmin(JSON.parse(stored))
            } catch {
                localStorage.removeItem(ADMIN_STORAGE_KEY)
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 500))

        const found = ADMIN_USERS.find(u => u.email === email && u.password === password)
        if (found) {
            const { password: _, ...userData } = found
            setAdmin(userData)
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = () => {
        setAdmin(null)
        localStorage.removeItem(ADMIN_STORAGE_KEY)
    }

    return (
        <AdminContext.Provider value={{
            admin,
            isLoading,
            login,
            logout,
            isAuthenticated: !!admin
        }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    const context = useContext(AdminContext)
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider')
    }
    return context
}
