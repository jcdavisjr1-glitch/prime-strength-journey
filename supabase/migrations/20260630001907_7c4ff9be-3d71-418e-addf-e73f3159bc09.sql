CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY INVOKER
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT
    auth.uid() = user_uuid
    AND EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = user_uuid
        AND environment = check_env
        AND (
          (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
          OR (status = 'canceled' AND current_period_end > now())
        )
    );
$function$;

CREATE OR REPLACE FUNCTION public.has_member_access(user_uuid uuid, check_env text DEFAULT 'live'::text)
 RETURNS boolean
 LANGUAGE sql
 SECURITY INVOKER
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT
    auth.uid() = user_uuid
    AND (
      EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = user_uuid
          AND environment = check_env
          AND (
            (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
            OR (status = 'canceled' AND current_period_end > now())
          )
      )
      OR EXISTS (
        SELECT 1 FROM public.one_time_purchases
        WHERE user_id = user_uuid
          AND environment = check_env
          AND grants_lifetime_access = true
      )
    );
$function$;