'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Check if this user has an admin profile stored
        const adminData = localStorage.getItem('campus-grab-admin')
        if (adminData) {
          router.push('/admin')
        } else {
          router.push('/canteens')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
    </div>
  )
}

