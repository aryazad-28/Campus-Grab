-- ============================================================
-- Business Logic Migration: Behavior-Based Rewards & Vouchers
-- Date: 2026-04-22
-- ============================================================

-- ============================================================
-- SECTION 1: REWARD POINTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reward_points (
    user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance    INT NOT NULL DEFAULT 0,
    lifetime_earned INT NOT NULL DEFAULT 0,
    total_orders INT NOT NULL DEFAULT 0,
    first_order_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rewards" ON public.reward_points;
CREATE POLICY "Users can view own rewards"
ON public.reward_points FOR SELECT
USING ((select auth.uid()) = user_id);

-- ============================================================
-- SECTION 2: USER VOUCHERS TABLE
-- Stores time-limited unlockable rewards
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_vouchers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    discount_amount NUMERIC NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    order_id        TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id ON public.user_vouchers (user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_expires_at ON public.user_vouchers (expires_at) WHERE is_used = FALSE;

ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can view own vouchers"
ON public.user_vouchers FOR SELECT
USING ((select auth.uid()) = user_id);

-- ============================================================
-- SECTION 3: REWARD TRANSACTIONS LEDGER
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired')),
    points      INT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    order_id    TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id ON public.reward_transactions (user_id);
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reward transactions" ON public.reward_transactions;
CREATE POLICY "Users can view own reward transactions"
ON public.reward_transactions FOR SELECT
USING ((select auth.uid()) = user_id);

-- ============================================================
-- SECTION 4: ADD COLUMNS TO ORDERS TABLE
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS convenience_fee NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_earned INT NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS voucher_id UUID REFERENCES public.user_vouchers(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS voucher_discount NUMERIC NOT NULL DEFAULT 0;

-- ============================================================
-- SECTION 5: UPDATE create_order FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order(
    p_id              TEXT DEFAULT NULL,
    p_admin_id        UUID DEFAULT NULL,
    p_items           JSONB DEFAULT '[]'::jsonb,
    p_total           NUMERIC DEFAULT 0,
    p_estimated_time  INT DEFAULT 15,
    p_status          TEXT DEFAULT 'pending',
    p_payment_method  TEXT DEFAULT 'online',
    p_user_name       TEXT DEFAULT NULL,
    p_user_email      TEXT DEFAULT NULL,
    p_convenience_fee NUMERIC DEFAULT 0,
    p_voucher_id      UUID DEFAULT NULL,
    p_voucher_discount NUMERIC DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
    v_order_id   TEXT;
    v_next_token INT;
    v_token_text TEXT;
    v_result     JSONB;
BEGIN
    SELECT COALESCE(MAX(CAST(NULLIF(regexp_replace(token_number, '[^0-9]', '', 'g'), '') AS INT)), 0) + 1
    INTO v_next_token
    FROM public.orders
    WHERE admin_id = p_admin_id
      AND DATE(created_at) = CURRENT_DATE;

    v_token_text := '#' || LPAD(v_next_token::TEXT, 4, '0');

    INSERT INTO public.orders (
        user_id, admin_id, items, total, token_number, status,
        estimated_time, payment_method, user_name, user_email,
        convenience_fee, voucher_id, voucher_discount
    )
    VALUES (
        (SELECT auth.uid()),
        p_admin_id,
        p_items,
        p_total,
        v_token_text,
        'pending',
        p_estimated_time,
        p_payment_method,
        p_user_name,
        p_user_email,
        p_convenience_fee,
        p_voucher_id,
        p_voucher_discount
    )
    RETURNING id INTO v_order_id;

    SELECT jsonb_build_object(
        'id', o.id,
        'token_number', o.token_number,
        'items', o.items,
        'total', o.total,
        'status', o.status,
        'created_at', o.created_at,
        'estimated_time', o.estimated_time,
        'payment_method', o.payment_method,
        'admin_id', o.admin_id,
        'user_name', o.user_name,
        'user_email', o.user_email,
        'convenience_fee', o.convenience_fee,
        'voucher_id', o.voucher_id,
        'voucher_discount', o.voucher_discount
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = v_order_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

-- ============================================================
-- SECTION 6: EARN REWARD POINTS & UNLOCK VOUCHERS
-- ============================================================

CREATE OR REPLACE FUNCTION public.earn_reward_points(
    p_user_id   UUID,
    p_order_id  TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_total_orders     INT;
    v_base_points      INT := 10;
    v_description      TEXT := 'Order completed (+10 pts)';
    v_orders_3_days    INT;
    v_current_balance  INT;
    v_vouchers_unlocked JSONB := '[]'::jsonb;
BEGIN
    -- Upsert reward_points row
    INSERT INTO public.reward_points (user_id, balance, lifetime_earned, total_orders, first_order_claimed, updated_at)
    VALUES (p_user_id, 0, 0, 0, FALSE, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- Increment total_orders
    UPDATE public.reward_points
    SET total_orders = total_orders + 1,
        balance = balance + v_base_points,
        lifetime_earned = lifetime_earned + v_base_points,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING total_orders, balance INTO v_total_orders, v_current_balance;

    -- Log transaction
    INSERT INTO public.reward_transactions (user_id, type, points, description, order_id)
    VALUES (p_user_id, 'earned', v_base_points, v_description, p_order_id);

    -- UPDATE ORDER with points earned
    UPDATE public.orders SET points_earned = v_base_points WHERE id = p_order_id;

    -- =======================================
    -- EVALUATE MILESTONES & GENERATE VOUCHERS
    -- =======================================

    -- 1. First Order Bonus (Welcome Voucher ₹15 off, 3 days)
    IF v_total_orders = 1 THEN
        INSERT INTO public.user_vouchers (user_id, title, description, discount_amount, expires_at)
        VALUES (p_user_id, 'Welcome Bonus', 'Thanks for your first order! Enjoy ₹15 off your next one.', 15, NOW() + INTERVAL '3 days');
        
        v_vouchers_unlocked := v_vouchers_unlocked || jsonb_build_object('title', 'Welcome Bonus', 'amount', 15);
        
        UPDATE public.reward_points SET first_order_claimed = TRUE WHERE user_id = p_user_id;
    END IF;

    -- 2. Streak Bonus: 3 orders in 3 days (₹20 off, 3 days)
    SELECT COUNT(*) INTO v_orders_3_days
    FROM public.orders
    WHERE user_id = p_user_id
      AND payment_verified = TRUE
      AND created_at >= NOW() - INTERVAL '3 days';

    IF v_orders_3_days >= 3 AND v_orders_3_days % 3 = 0 THEN
        INSERT INTO public.user_vouchers (user_id, title, description, discount_amount, expires_at)
        VALUES (p_user_id, '3-Day Streak!', 'You are on fire! Here is ₹20 off for keeping the streak alive.', 20, NOW() + INTERVAL '3 days');
        
        v_vouchers_unlocked := v_vouchers_unlocked || jsonb_build_object('title', '3-Day Streak!', 'amount', 20);
    END IF;

    -- 3. Milestone: Every 5th Order (₹30 off, 7 days)
    IF v_total_orders >= 5 AND v_total_orders % 5 = 0 THEN
        INSERT INTO public.user_vouchers (user_id, title, description, discount_amount, expires_at)
        VALUES (p_user_id, '5th Order Milestone', 'Boom! You hit a milestone. Enjoy a massive ₹30 off!', 30, NOW() + INTERVAL '7 days');
        
        v_vouchers_unlocked := v_vouchers_unlocked || jsonb_build_object('title', '5th Order Milestone', 'amount', 30);
    END IF;

    -- 4. Reward Meter: Every 200 points (₹15 off, 7 days)
    IF v_current_balance >= 200 THEN
        -- Deduct 200 points
        UPDATE public.reward_points
        SET balance = balance - 200
        WHERE user_id = p_user_id;

        -- Log deduction
        INSERT INTO public.reward_transactions (user_id, type, points, description)
        VALUES (p_user_id, 'redeemed', 200, 'Meter filled: Converted 200 pts to Voucher');

        -- Create voucher
        INSERT INTO public.user_vouchers (user_id, title, description, discount_amount, expires_at)
        VALUES (p_user_id, 'Meter Unlocked!', 'You filled your GrabPoints meter! ₹15 off.', 15, NOW() + INTERVAL '7 days');

        v_vouchers_unlocked := v_vouchers_unlocked || jsonb_build_object('title', 'Meter Unlocked!', 'amount', 15);
    END IF;

    RETURN jsonb_build_object(
        'points_earned', v_base_points,
        'new_balance', (SELECT balance FROM public.reward_points WHERE user_id = p_user_id),
        'vouchers_unlocked', v_vouchers_unlocked
    );
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';

-- ============================================================
-- SECTION 7: GET USER REWARDS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_rewards(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_balance INT;
    v_lifetime INT;
    v_total_orders INT;
    v_first_claimed BOOLEAN;
    v_orders_3_days INT;
    v_orders_7_days INT;
    v_transactions JSONB;
    v_active_vouchers JSONB;
BEGIN
    SELECT balance, lifetime_earned, total_orders, first_order_claimed
    INTO v_balance, v_lifetime, v_total_orders, v_first_claimed
    FROM public.reward_points
    WHERE user_id = p_user_id;

    IF v_balance IS NULL THEN
        v_balance := 0;
        v_lifetime := 0;
        v_total_orders := 0;
        v_first_claimed := FALSE;
    END IF;

    SELECT COUNT(*) INTO v_orders_3_days
    FROM public.orders
    WHERE user_id = p_user_id
      AND payment_verified = TRUE
      AND created_at >= NOW() - INTERVAL '3 days';

    SELECT COUNT(*) INTO v_orders_7_days
    FROM public.orders
    WHERE user_id = p_user_id
      AND payment_verified = TRUE
      AND created_at >= NOW() - INTERVAL '7 days';

    -- Get active vouchers
    SELECT COALESCE(jsonb_agg(v ORDER BY v.expires_at ASC), '[]'::jsonb)
    INTO v_active_vouchers
    FROM (
        SELECT id, title, description, discount_amount, expires_at
        FROM public.user_vouchers
        WHERE user_id = p_user_id
          AND is_used = FALSE
          AND expires_at > NOW()
    ) v;

    -- Recent transactions
    SELECT COALESCE(jsonb_agg(t ORDER BY t.created_at DESC), '[]'::jsonb)
    INTO v_transactions
    FROM (
        SELECT id, type, points, description, created_at
        FROM public.reward_transactions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 20
    ) t;

    RETURN jsonb_build_object(
        'balance', v_balance,
        'lifetime_earned', v_lifetime,
        'total_orders', v_total_orders,
        'first_order_claimed', v_first_claimed,
        'streak_3_day', v_orders_3_days,
        'streak_7_day', v_orders_7_days,
        'active_vouchers', v_active_vouchers,
        'transactions', v_transactions,
        'meter_max', 200
    );
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = '';
