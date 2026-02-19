import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Extracts and verifies the user's Supabase auth token from the request.
 * Returns the authenticated user's ID and email, or an error response.
 * 
 * Usage:
 *   const auth = await getAuthenticatedUser(request)
 *   if (auth.error) return auth.error
 *   const { userId, email } = auth
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<
    { userId: string; email: string; error?: never } |
    { userId?: never; email?: never; error: NextResponse }
> {
    // Extract the access token from Authorization header or cookies
    const authHeader = request.headers.get('authorization')
    let accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    // Fallback: try to get token from Supabase auth cookie
    if (!accessToken) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
            // Supabase stores tokens in cookies with project ref prefix
            const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
            const tokenCookie = request.cookies.get(`sb-${projectRef}-auth-token`)
            if (tokenCookie?.value) {
                try {
                    const parsed = JSON.parse(tokenCookie.value)
                    accessToken = parsed?.access_token || parsed?.[0] || null
                } catch {
                    // Cookie might be the raw token
                    accessToken = tokenCookie.value
                }
            }
        }
    }

    if (!accessToken) {
        return {
            error: NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }
    }

    // Verify the token with Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        return {
            error: NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Use the service role to verify the JWT and get the user
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
        return {
            error: NextResponse.json(
                { error: 'Invalid or expired authentication token' },
                { status: 401 }
            )
        }
    }

    return {
        userId: user.id,
        email: user.email || '',
    }
}

/**
 * Creates a Supabase client with the service role key.
 * Use this for server-side operations that need to bypass RLS.
 */
export function getServiceSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase credentials')
    }

    return createClient(supabaseUrl, supabaseServiceKey)
}
