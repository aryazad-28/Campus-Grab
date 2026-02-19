import { supabase } from './supabase'

/**
 * Returns the current Supabase access token for use in API calls.
 * Attach this as `Authorization: Bearer <token>` header.
 */
export async function getAccessToken(): Promise<string | null> {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data?.session?.access_token ?? null
}

/**
 * Creates headers object with Authorization bearer token for API calls.
 * Falls back to Content-Type only if no session exists.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAccessToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
}
