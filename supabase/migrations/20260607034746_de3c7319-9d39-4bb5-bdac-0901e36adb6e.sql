-- Track one-time purchases (Single Plan = lifetime access)
CREATE TABLE public.one_time_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  environment text NOT NULL DEFAULT 'sandbox',
  grants_lifetime_access boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_one_time_purchases_user_id ON public.one_time_purchases(user_id);

GRANT SELECT ON public.one_time_purchases TO authenticated;
GRANT ALL ON public.one_time_purchases TO service_role;

ALTER TABLE public.one_time_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own purchases"
  ON public.one_time_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Members-only mailing list
CREATE TABLE public.mailing_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  source text NOT NULL DEFAULT 'subscription',
  subscribed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

GRANT SELECT ON public.mailing_list TO authenticated;
GRANT ALL ON public.mailing_list TO service_role;

ALTER TABLE public.mailing_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mailing entry"
  ON public.mailing_list FOR SELECT
  USING (auth.uid() = user_id);

-- Combined access check: active subscription OR lifetime purchase
CREATE OR REPLACE FUNCTION public.has_member_access(user_uuid uuid, check_env text DEFAULT 'live')
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_active_subscription(user_uuid, check_env)
    OR EXISTS (
      SELECT 1 FROM public.one_time_purchases
      WHERE user_id = user_uuid
        AND environment = check_env
        AND grants_lifetime_access = true
    );
$$;