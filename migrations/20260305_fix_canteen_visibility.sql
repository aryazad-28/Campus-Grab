-- ============================================================
-- Fix: Allow students to see approved canteens
-- Date: 2026-03-05
--
-- Problem: The RLS policy on admin_profiles only allows
-- users to SELECT their own row (auth.uid() = user_id).
-- This means students cannot see ANY canteen because the
-- canteens page queries admin_profiles.
--
-- Solution: Add a permissive SELECT policy that lets
-- everyone (authenticated or anon) read admin_profiles
-- rows WHERE status = 'approved'. The existing "own profile"
-- policy remains, so admins can always see their own row
-- regardless of status.
-- ============================================================

-- Drop if it already exists (idempotent)
DROP POLICY IF EXISTS "Public can view approved canteens" ON public.admin_profiles;

-- Allow anyone to read approved canteen profiles
CREATE POLICY "Public can view approved canteens"
ON public.admin_profiles FOR SELECT
USING (status = 'approved');
