import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Load Test API Route
 * 
 * Simulates concurrent order creation to stress-test the Supabase backend.
 * 
 * Usage: GET /api/load-test?count=250&batch=50
 *   - count: total number of orders to create (default: 50, max: 500)
 *   - batch: concurrent batch size (default: 25, max: 100)
 *   - cleanup: set to "false" to keep test data (default: true)
 * 
 * ⚠️ REMOVE THIS ROUTE BEFORE PRODUCTION
 */

interface TestResult {
    orderId: string
    tokenNumber: string
    latencyMs: number
    success: boolean
    error?: string
}

export async function GET(request: NextRequest) {
    const startTime = performance.now()

    // Parse params
    const { searchParams } = new URL(request.url)
    const totalCount = Math.min(parseInt(searchParams.get('count') || '50'), 500)
    const batchSize = Math.min(parseInt(searchParams.get('batch') || '25'), 100)
    const shouldCleanup = searchParams.get('cleanup') !== 'false'

    // Validate env
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Find the Bunk Spot admin for test orders
    const { data: admin } = await supabase
        .from('admin_profiles')
        .select('id, canteen_name')
        .eq('status', 'approved')
        .limit(1)
        .single()

    if (!admin) {
        return NextResponse.json({ error: 'No approved admin found for testing' }, { status: 404 })
    }

    const results: TestResult[] = []
    const testOrderIds: string[] = []

    // Create a single test order
    const createTestOrder = async (index: number): Promise<TestResult> => {
        const orderStart = performance.now()
        const tempId = `LOAD-TEST-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`

        try {
            const { data, error } = await supabase.rpc('create_order', {
                p_id: tempId,
                p_admin_id: admin.id,
                p_items: [
                    { name: `Test Burger #${index}`, quantity: 1, price: 120 },
                    { name: `Test Fries #${index}`, quantity: 2, price: 80 },
                ],
                p_total: 280,
                p_estimated_time: 10,
                p_status: 'pending',
                p_payment_method: 'load_test'
            })

            const latencyMs = Math.round(performance.now() - orderStart)

            if (error) {
                return {
                    orderId: tempId,
                    tokenNumber: 'FAILED',
                    latencyMs,
                    success: false,
                    error: error.message
                }
            }

            // The RPC returns the created order data
            const orderId = data?.id || tempId
            testOrderIds.push(orderId)

            return {
                orderId,
                tokenNumber: data?.token_number || 'N/A',
                latencyMs,
                success: true
            }
        } catch (err: any) {
            return {
                orderId: tempId,
                tokenNumber: 'FAILED',
                latencyMs: Math.round(performance.now() - orderStart),
                success: false,
                error: err.message
            }
        }
    }

    // Run in batches
    const batches = Math.ceil(totalCount / batchSize)

    for (let b = 0; b < batches; b++) {
        const batchStart = b * batchSize
        const batchEnd = Math.min(batchStart + batchSize, totalCount)
        const batchPromises: Promise<TestResult>[] = []

        for (let i = batchStart; i < batchEnd; i++) {
            batchPromises.push(createTestOrder(i))
        }

        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
    }

    // Calculate stats
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    const latencies = successful.map(r => r.latencyMs).sort((a, b) => a - b)

    const stats = {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: `${((successful.length / results.length) * 100).toFixed(1)}%`,
        latency: latencies.length > 0 ? {
            min: `${latencies[0]}ms`,
            max: `${latencies[latencies.length - 1]}ms`,
            avg: `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)}ms`,
            median: `${latencies[Math.floor(latencies.length / 2)]}ms`,
            p95: `${latencies[Math.floor(latencies.length * 0.95)]}ms`,
            p99: `${latencies[Math.floor(latencies.length * 0.99)]}ms`,
        } : null,
        totalTimeMs: Math.round(performance.now() - startTime),
        ordersPerSecond: ((successful.length / (performance.now() - startTime)) * 1000).toFixed(1),
        config: {
            totalOrders: totalCount,
            batchSize,
            batches,
            canteen: admin.canteen_name,
        }
    }

    // Check for unique token numbers (concurrency safety)
    const tokens = successful.map(r => r.tokenNumber).filter(t => t !== 'N/A')
    const uniqueTokens = new Set(tokens)
    const tokenCollisions = tokens.length - uniqueTokens.size

    // Cleanup test data
    let cleanupResult = null
    if (shouldCleanup && testOrderIds.length > 0) {
        const { error: cleanupError, count } = await supabase
            .from('orders')
            .delete()
            .eq('payment_method', 'load_test')

        cleanupResult = cleanupError
            ? { success: false, error: cleanupError.message }
            : { success: true, deletedCount: count || testOrderIds.length }
    }

    // Errors breakdown
    const errorBreakdown: Record<string, number> = {}
    failed.forEach(r => {
        const key = r.error || 'Unknown'
        errorBreakdown[key] = (errorBreakdown[key] || 0) + 1
    })

    return NextResponse.json({
        '🏁 LOAD TEST RESULTS': '========================',
        stats,
        concurrencySafety: {
            uniqueTokenNumbers: uniqueTokens.size,
            totalTokens: tokens.length,
            collisions: tokenCollisions,
            verdict: tokenCollisions === 0 ? '✅ PASS — No token collisions' : `⚠️ FAIL — ${tokenCollisions} token collisions detected`
        },
        cleanup: cleanupResult,
        errors: Object.keys(errorBreakdown).length > 0 ? errorBreakdown : 'None',
        sampleOrders: successful.slice(0, 5).map(r => ({
            token: r.tokenNumber,
            latency: `${r.latencyMs}ms`
        })),
        verdict: successful.length === totalCount
            ? `✅ PASS — All ${totalCount} orders created successfully at ${stats.ordersPerSecond} orders/sec`
            : `⚠️ PARTIAL — ${successful.length}/${totalCount} orders succeeded (${failed.length} failed)`
    })
}
