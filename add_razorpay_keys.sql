-- Add Razorpay Live Keys to Admin Profile
-- Run this in Supabase SQL Editor

UPDATE admin_profiles
SET 
  razorpay_key_id = 'rzp_live_SG17clCd1oiH1e',
  razorpay_key_secret = 'pkq1WYPooh0fmsJ4rOQ7wPYj'
WHERE id = 'd49d6312-b2e0-467d-9ce7-d97ef6a26b57';

-- Verify the update
SELECT id, canteen_name, razorpay_key_id FROM admin_profiles WHERE id = 'd49d6312-b2e0-467d-9ce7-d97ef6a26b57';
