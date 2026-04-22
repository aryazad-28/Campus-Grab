-- 20260422_business_logic.sql
-- Pivot to Strict Points System (No Vouchers, Full Redemption Only)

BEGIN;

-- 1. Clean up previous voucher schema if it exists
DROP TABLE IF EXISTS public.user_vouchers CASCADE;

-- 2. Modify orders table to track points_paid
ALTER TABLE public.orders DROP COLUMN IF EXISTS voucher_id;
ALTER TABLE public.orders DROP COLUMN IF EXISTS voucher_discount;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'points_paid') THEN
        ALTER TABLE public.orders ADD COLUMN points_paid integer DEFAULT 0;
    END IF;
END $$;

-- 3. Ensure rewards tables exist
CREATE TABLE IF NOT EXISTS public.user_rewards (
    user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
    balance integer DEFAULT 0 CHECK (balance >= 0),
    lifetime_earned integer DEFAULT 0,
    total_orders integer DEFAULT 0,
    first_order_claimed boolean DEFAULT false,
    streak_3_day integer DEFAULT 0,
    streak_7_day integer DEFAULT 0,
    last_order_date timestamp with time zone,
    last_redemption_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_rewards
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;
CREATE POLICY "Users can view their own rewards"
    ON public.user_rewards FOR SELECT
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.reward_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    type text NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired')),
    points integer NOT NULL,
    description text NOT NULL,
    order_id text REFERENCES public.orders(id),
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on reward_transactions
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.reward_transactions;
CREATE POLICY "Users can view their own transactions"
    ON public.reward_transactions FOR SELECT
    USING (auth.uid() = user_id);


-- 4. Recreate earn_reward_points
CREATE OR REPLACE FUNCTION public.earn_reward_points(
    p_user_id uuid,
    p_order_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base_points integer := 5;
    v_total_points integer := 5;
    v_bonus_description text := 'Order completed';
    v_user_rewards record;
    v_days_since_last integer;
    v_is_first_order boolean := false;
    v_streak_3_day integer := 0;
    v_streak_7_day integer := 0;
BEGIN
    -- 1. Ensure user exists in user_rewards
    INSERT INTO public.user_rewards (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- 2. Fetch current rewards state
    SELECT * INTO v_user_rewards FROM public.user_rewards WHERE user_id = p_user_id;

    -- 3. Calculate first order bonus
    IF NOT v_user_rewards.first_order_claimed THEN
        v_total_points := v_total_points + 50;
        v_is_first_order := true;
        v_bonus_description := 'First order + Base points';
    END IF;

    -- 4. Calculate streak bonuses
    v_days_since_last := EXTRACT(DAY FROM (now() - COALESCE(v_user_rewards.last_order_date, now() - interval '100 days')));
    
    v_streak_3_day := v_user_rewards.streak_3_day;
    v_streak_7_day := v_user_rewards.streak_7_day;

    IF v_days_since_last <= 1 THEN
        v_streak_3_day := v_streak_3_day + 1;
        v_streak_7_day := v_streak_7_day + 1;
    ELSIF v_days_since_last > 1 THEN
        v_streak_3_day := 1;
        v_streak_7_day := 1;
    END IF;

    -- 3-day streak hit
    IF v_streak_3_day >= 3 THEN
        v_total_points := v_total_points + 20;
        v_bonus_description := '3-Day Streak Bonus!';
        v_streak_3_day := 0;
    END IF;

    -- 7-day streak hit
    IF v_streak_7_day >= 5 THEN
        v_total_points := v_total_points + 50;
        v_bonus_description := '7-Day Streak Bonus!';
        v_streak_7_day := 0;
    END IF;

    -- 5. Add transaction (expires in 30 days)
    INSERT INTO public.reward_transactions (user_id, type, points, description, order_id, expires_at)
    VALUES (p_user_id, 'earned', v_total_points, v_bonus_description, p_order_id, now() + interval '30 days');

    -- 6. Update user_rewards
    UPDATE public.user_rewards
    SET 
        balance = balance + v_total_points,
        lifetime_earned = lifetime_earned + v_total_points,
        total_orders = total_orders + 1,
        first_order_claimed = true,
        streak_3_day = v_streak_3_day,
        streak_7_day = v_streak_7_day,
        last_order_date = now(),
        updated_at = now()
    WHERE user_id = p_user_id;

    RETURN json_build_object(
        'success', true,
        'points_earned', v_total_points,
        'description', v_bonus_description
    );
END;
$$;


-- 5. Create strict redeem_reward_points
CREATE OR REPLACE FUNCTION public.redeem_reward_points(
    p_user_id uuid,
    p_order_id text,
    p_order_total numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_points_to_deduct integer;
    v_user_rewards record;
    v_days_since_last_redemption integer;
BEGIN
    -- 1. Validate order total (Max ₹120)
    IF p_order_total > 120 THEN
        RETURN json_build_object('success', false, 'error', 'Order exceeds maximum allowed value for point redemption (₹120 limit).');
    END IF;

    -- Calculate points to deduct (20 points = ₹1)
    v_points_to_deduct := CEIL(p_order_total * 20);

    -- 2. Lock and fetch user rewards state
    SELECT * INTO v_user_rewards 
    FROM public.user_rewards 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User rewards not found.');
    END IF;

    -- 3. Check 2000 points balance threshold unlock
    IF v_user_rewards.balance < 2000 THEN
        RETURN json_build_object('success', false, 'error', 'Minimum 2000 points required to unlock full redemption.');
    END IF;

    -- 4. Check actual balance
    IF v_user_rewards.balance < v_points_to_deduct THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient points for this order value.');
    END IF;

    -- 5. Check 7-day frequency limit
    IF v_user_rewards.last_redemption_date IS NOT NULL THEN
        v_days_since_last_redemption := EXTRACT(DAY FROM (now() - v_user_rewards.last_redemption_date));
        IF v_days_since_last_redemption < 7 THEN
            RETURN json_build_object('success', false, 'error', 'You can only redeem points once every 7 days.');
        END IF;
    END IF;

    -- 6. Deduct points and log transaction
    UPDATE public.user_rewards
    SET 
        balance = balance - v_points_to_deduct,
        last_redemption_date = now(),
        updated_at = now()
    WHERE user_id = p_user_id;

    INSERT INTO public.reward_transactions (user_id, type, points, description, order_id)
    VALUES (p_user_id, 'redeemed', v_points_to_deduct, 'Full Order Redemption', p_order_id);

    -- 7. Update order to reflect points paid
    UPDATE public.orders
    SET 
        points_paid = v_points_to_deduct,
        payment_method = 'points',
        status = 'preparing',
        payment_verified = true
    WHERE id = p_order_id;

    RETURN json_build_object(
        'success', true,
        'points_deducted', v_points_to_deduct,
        'new_balance', v_user_rewards.balance - v_points_to_deduct
    );
END;
$$;


-- 6. Update get_user_rewards to include last_redemption_date
CREATE OR REPLACE FUNCTION public.get_user_rewards(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rewards record;
    v_transactions json;
    v_expiring_points integer := 0;
    v_next_expiry timestamp with time zone;
    v_days_since_last_redemption integer := 999;
    v_can_redeem_frequency boolean := true;
BEGIN
    SELECT * INTO v_rewards FROM public.user_rewards WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'balance', 0, 'lifetime_earned', 0, 'total_orders', 0,
            'first_order_claimed', false, 'streak_3_day', 0, 'streak_7_day', 0,
            'transactions', '[]'::json, 'next_expiry', null, 'expiring_points', 0,
            'can_redeem_frequency', true, 'days_until_next_redemption', 0
        );
    END IF;

    -- Calculate expiring points (within next 7 days)
    SELECT COALESCE(SUM(points), 0), MIN(expires_at)
    INTO v_expiring_points, v_next_expiry
    FROM public.reward_transactions
    WHERE user_id = p_user_id
        AND type = 'earned'
        AND expires_at IS NOT NULL
        AND expires_at > now()
        AND expires_at <= now() + interval '7 days'
        AND id NOT IN (
            SELECT id FROM public.reward_transactions 
            WHERE user_id = p_user_id AND type = 'expired'
        );

    -- Fetch recent transactions
    SELECT COALESCE(json_agg(t), '[]'::json) INTO v_transactions
    FROM (
        SELECT id, type, points, description, created_at
        FROM public.reward_transactions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 10
    ) t;

    -- Calculate frequency lock
    IF v_rewards.last_redemption_date IS NOT NULL THEN
        v_days_since_last_redemption := EXTRACT(DAY FROM (now() - v_rewards.last_redemption_date));
        IF v_days_since_last_redemption < 7 THEN
            v_can_redeem_frequency := false;
        END IF;
    END IF;

    RETURN json_build_object(
        'balance', v_rewards.balance,
        'lifetime_earned', v_rewards.lifetime_earned,
        'total_orders', v_rewards.total_orders,
        'first_order_claimed', v_rewards.first_order_claimed,
        'streak_3_day', v_rewards.streak_3_day,
        'streak_7_day', v_rewards.streak_7_day,
        'transactions', v_transactions,
        'next_expiry', v_next_expiry,
        'expiring_points', v_expiring_points,
        'can_redeem_frequency', v_can_redeem_frequency,
        'days_until_next_redemption', GREATEST(0, 7 - v_days_since_last_redemption)
    );
END;
$$;

COMMIT;
