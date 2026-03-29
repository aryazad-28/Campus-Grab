'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Check auth directly to prevent Provider conflicts
    const verifyRoute = async () => {
      try {
        if (!supabase) throw new Error('No Supabase provided')

        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        if (!session) {
          // If no session, fallback to local storage clues for routing
          const adminData = localStorage.getItem('campus-grab-admin')
          if (adminData) {
            router.push('/admin/login')
          } else {
            router.push('/login')
          }
          return
        }

        // If active session, check the role
        const accountType = session.user.user_metadata?.account_type
        
        if (accountType === 'admin') {
          router.push('/admin')
        } else if (accountType === 'student') {
          router.push('/canteens')
        } else {
          // Unassigned accounts or legacy
          const adminData = localStorage.getItem('campus-grab-admin')
          if (adminData) {
            router.push('/admin')
          } else {
            router.push('/canteens')
          }
        }
      } catch (err) {
        // Fallback for demo mode
        if (mounted) {
            const adminData = localStorage.getItem('campus-grab-admin')
            if (adminData) {
              router.push('/admin')
            } else {
              router.push('/login')
            }
        }
      }
    }

    verifyRoute()
    
    return () => { mounted = false }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
    </div>
  )
}
