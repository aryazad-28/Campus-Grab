# Razorpay Integration - Setup Instructions

## Prerequisites
- Razorpay Test Account (for each vendor/admin)
- Supabase access

## 1. Database Setup

Run the migration SQL in your Supabase SQL Editor:

```sql
-- Add Razorpay credentials columns to admin_profiles table
ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS razorpay_key_id TEXT;

ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS razorpay_key_secret TEXT;

-- Add payment tracking columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
```

## 2. Environment Variables

Add to your `.env.local`:

```env
# Supabase Service Role Key (for API routes)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Razorpay Webhook Secret (for additional validation)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

> **Note**: Get your Supabase Service Role Key from: Dashboard → Settings → API → service_role key

## 3. Vendor/Admin Setup

Each canteen admin needs to:

1. **Create Razorpay Account** (if not already):
   - Go to https://razorpay.com
   - Sign up and complete KYC

2. **Get API Keys**:
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate Test/Live keys
   - Copy `key_id` and `key_secret`

3. **Update Admin Profile in Supabase**:
   ```sql
   UPDATE admin_profiles
   SET 
     razorpay_key_id = 'rzp_test_xxxxx',
     razorpay_key_secret = 'your_secret_key_here'
   WHERE id = 'your_admin_id';
   ```

## 4. Webhook Setup (Optional but Recommended)

For each vendor in their Razorpay Dashboard:

1. Go to Settings → Webhooks
2. Add Webhook URL: `https://campus-grab.vercel.app/api/razorpay/webhook`
3. Select Events:
   - `payment.captured`
   - `payment.failed`
4. Copy Webhook Secret and add to `.env.local` as `SVyjMmv_Mp_@Z8G`

## 5. Testing

### Test Mode:
- Use Razorpay test keys (start with `rzp_test_`)
- Test UPI IDs: `success@razorpay`, `failure@razorpay`

### Test Flow:
1. Add items to cart
2. Click "Place Order"
3. Razorpay Checkout opens (UPI only)
4. Use test UPI ID or scan test QR
5. Payment succeeds → Order status changes to "preparing"

## Payment Flow Diagram

```
User → Cart → Place Order
  ↓
Create DB Order (status: pending)
  ↓
Create Razorpay Order (via API)
  ↓
Open Razorpay Checkout (UPI only)
  ↓
Payment Success → Verify Signature (server)
  ↓
Update Order (status: preparing, payment_verified: true)
  ↓
Show Confirmation ✓
```

## Security Checklist

✅ Secret keys never exposed to frontend
✅ Amount calculated server-side
✅ Signature verification on server
✅ Order-canteen association verified
✅ HTTPS required for production
✅ Service role key in environment only

## Troubleshooting

**"Vendor has not configured Razorpay credentials"**
→ Admin needs to add their Razorpay keys to database

**"Payment verification failed"**
→ Check Razorpay secret key is correct
→ Ensure order belongs to correct canteen

**Razorpay Checkout not opening**
→ Check browser console for errors
→ Ensure Razorpay script is loaded (check Network tab)

**Webhook not working**
→ Verify webhook URL is accessible
→ Check webhook signature matches secret
