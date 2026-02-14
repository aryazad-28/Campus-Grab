-- Migration: Add Razorpay credentials to admin_profiles table
-- This allows each admin to store their own Razorpay account credentials
-- for the Vendor-as-Merchant model

-- Add razorpay_key_id column (public key)
ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS razorpay_key_id TEXT;

-- Add razorpay_key_secret column (secret key)
-- NOTE: In production, consider using Supabase Vault for storing secrets
ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS razorpay_key_secret TEXT;

-- Add comment to table
COMMENT ON COLUMN admin_profiles.razorpay_key_id IS 'Razorpay public API key (e.g., rzp_test_xxx)';
COMMENT ON COLUMN admin_profiles.razorpay_key_secret IS 'Razorpay secret API key - should be kept secure';
