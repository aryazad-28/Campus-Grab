/**
 * Load Testing Script for Campus Grab Concurrent Orders
 * 
 * This script simulates 100 concurrent order placements to test:
 * 1. Database token generation uniqueness
 * 2. Order insertion performance under load
 * 3. Concurrent transaction handling
 * 
 * Usage:
 *   node scripts/load-test.js
 * 
 * Prerequisites:
 *   - npm install @supabase/supabase-js dotenv
 *   - Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample menu items for test orders
const SAMPLE_ITEMS = [
    { name: 'Veggie Burger', price: 80, quantity: 1, eta_minutes: 10 },
    { name: 'Chicken Pizza', price: 150, quantity: 1, eta_minutes: 15 },
    { name: 'Pasta Carbonara', price: 120, quantity: 1, eta_minutes: 12 },
    { name: 'Fries', price: 40, quantity: 2, eta_minutes: 5 },
    { name: 'Lasagna', price: 140, quantity: 1, eta_minutes: 18 },
];

/**
 * Create a single test order
 */
async function createOrder(orderNumber) {
    const items = [SAMPLE_ITEMS[orderNumber % SAMPLE_ITEMS.length]];
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const estimated_time = Math.max(...items.map(i => i.eta_minutes));

    const startTime = Date.now();

    try {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                items,
                total,
                estimated_time,
                status: 'pending',
                payment_method: 'test',
            })
            .select()
            .single();

        const duration = Date.now() - startTime;

        if (error) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                duration,
                orderNumber,
            };
        }

        return {
            success: true,
            order: data,
            duration,
            orderNumber,
            tokenNumber: data.token_number,
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            duration: Date.now() - startTime,
            orderNumber,
        };
    }
}

/**
 * Run concurrent order load test
 */
async function runLoadTest(concurrentOrders = 100) {
    console.log(`\n🚀 Starting load test with ${concurrentOrders} concurrent orders...\n`);

    const startTime = Date.now();

    // Create promises for all concurrent orders
    const orderPromises = Array.from({ length: concurrentOrders }, (_, i) => createOrder(i + 1));

    // Execute all orders concurrently
    const results = await Promise.all(orderPromises);

    const totalDuration = Date.now() - startTime;

    // Analyze results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    const tokenNumbers = successful.map(r => r.tokenNumber);
    const uniqueTokens = new Set(tokenNumbers);
    const hasDuplicates = uniqueTokens.size !== tokenNumbers.length;

    const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
    const maxDuration = Math.max(...successful.map(r => r.duration));
    const minDuration = Math.min(...successful.map(r => r.duration));

    // Print results
    console.log('📊 LOAD TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Orders:        ${concurrentOrders}`);
    console.log(`✅ Successful:        ${successful.length} (${(successful.length / concurrentOrders * 100).toFixed(1)}%)`);
    console.log(`❌ Failed:            ${failed.length} (${(failed.length / concurrentOrders * 100).toFixed(1)}%)`);
    console.log(`\n⏱️  PERFORMANCE`);
    console.log(`Total Time:          ${totalDuration}ms`);
    console.log(`Average Response:    ${avgDuration.toFixed(2)}ms`);
    console.log(`Fastest Response:    ${minDuration}ms`);
    console.log(`Slowest Response:    ${maxDuration}ms`);
    console.log(`\n🎫 TOKEN UNIQUENESS`);
    console.log(`Total Tokens:        ${tokenNumbers.length}`);
    console.log(`Unique Tokens:       ${uniqueTokens.size}`);
    console.log(`Duplicates Found:    ${hasDuplicates ? '❌ YES' : '✅ NO'}`);

    if (hasDuplicates) {
        const duplicates = tokenNumbers.filter((token, index) => tokenNumbers.indexOf(token) !== index);
        console.log(`Duplicate Tokens:    ${[...new Set(duplicates)].join(', ')}`);
    }

    // Show sample tokens
    console.log(`\nSample Token Numbers:`);
    tokenNumbers.slice(0, 10).forEach((token, i) => {
        console.log(`  ${i + 1}. ${token}`);
    });

    // Show errors if any
    if (failed.length > 0) {
        console.log(`\n❌ ERRORS (${failed.length} total)`);
        console.log('='.repeat(60));
        const errorGroups = failed.reduce((acc, r) => {
            const key = r.code || 'unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        Object.entries(errorGroups).forEach(([code, count]) => {
            console.log(`  ${code}: ${count} errors`);
        });

        // Show first 3 error details
        console.log(`\nFirst 3 error details:`);
        failed.slice(0, 3).forEach((r, i) => {
            console.log(`  ${i + 1}. Order #${r.orderNumber}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    // Return test passed/failed
    const testPassed = !hasDuplicates && (successful.length / concurrentOrders) >= 0.95;

    if (testPassed) {
        console.log('✅ LOAD TEST PASSED\n');
    } else {
        console.log('❌ LOAD TEST FAILED\n');
        if (hasDuplicates) console.log('   - Duplicate token numbers detected');
        if ((successful.length / concurrentOrders) < 0.95) console.log('   - Success rate below 95%');
    }

    return testPassed;
}

/**
 * Cleanup test orders
 */
async function cleanup() {
    console.log('\n🧹 Cleaning up test orders...');

    try {
        // Delete today's test orders
        const today = new Date().toISOString().split('T')[0];
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('payment_method', 'test')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`);

        if (error) {
            console.error('❌ Cleanup error:', error.message);
        } else {
            console.log('✅ Test orders cleaned up successfully\n');
        }
    } catch (err) {
        console.error('❌ Cleanup failed:', err.message);
    }
}

// Main execution
(async () => {
    try {
        const testPassed = await runLoadTest(100);

        // Ask if user wants to cleanup
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('\nCleanup test orders? (y/n): ', async (answer) => {
            if (answer.toLowerCase() === 'y') {
                await cleanup();
            }
            readline.close();
            process.exit(testPassed ? 0 : 1);
        });

    } catch (err) {
        console.error('\n❌ Load test crashed:', err);
        process.exit(1);
    }
})();
