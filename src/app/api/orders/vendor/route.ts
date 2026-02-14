import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { searchParams } = new URL(request.url)
        const adminId = searchParams.get('admin_id')
        const month = searchParams.get('month') // 1-12
        const year = searchParams.get('year') // YYYY
        const date = searchParams.get('date') // YYYY-MM-DD (optional specific date)

        if (!adminId) {
            return NextResponse.json({ error: 'Missing admin_id' }, { status: 400 })
        }

        // If specific date is requested, return all orders for that date
        if (date) {
            const startOfDay = new Date(date + 'T00:00:00+05:30').toISOString()
            const endOfDay = new Date(date + 'T23:59:59+05:30').toISOString()

            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, token_number, items, total, status, created_at, payment_method, estimated_time')
                .eq('admin_id', adminId)
                .neq('status', 'pending') // Only paid orders
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching vendor orders:', error)
                return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
            }

            const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0)

            return NextResponse.json({
                date,
                orders: orders || [],
                orderCount: (orders || []).length,
                totalRevenue
            })
        }

        // If month/year requested, return day-wise summaries
        const currentYear = year ? parseInt(year) : new Date().getFullYear()
        const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1

        const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString()
        const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59).toISOString()

        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total, status, created_at')
            .eq('admin_id', adminId)
            .neq('status', 'pending') // Only paid orders
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching vendor order summaries:', error)
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
        }

        // Group by date and create summaries
        const daySummaries: Record<string, { orderCount: number; totalRevenue: number }> = {}
        for (const order of orders || []) {
            const dateKey = new Date(order.created_at).toISOString().split('T')[0]
            if (!daySummaries[dateKey]) {
                daySummaries[dateKey] = { orderCount: 0, totalRevenue: 0 }
            }
            daySummaries[dateKey].orderCount += 1
            daySummaries[dateKey].totalRevenue += order.total || 0
        }

        const result = Object.entries(daySummaries)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, summary]) => ({
                date,
                ...summary
            }))

        const monthTotal = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0)

        return NextResponse.json({
            month: currentMonth,
            year: currentYear,
            days: result,
            monthTotal,
            totalOrders: (orders || []).length
        })
    } catch (error) {
        console.error('Vendor orders error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
