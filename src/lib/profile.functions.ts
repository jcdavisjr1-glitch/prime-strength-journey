import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfileAndAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, fitness_level, equipment_type, goal, onboarding_completed, weekly_walking_goal_minutes")
      .eq("id", userId)
      .maybeSingle();

    const { data: hasAccess } = await supabase.rpc("has_member_access", {
      user_uuid: userId,
      check_env: "sandbox",
    });

    // Get subscription/purchase summary
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, product_id, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: purchase } = await supabase
      .from("one_time_purchases")
      .select("product_id, grants_lifetime_access")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    return {
      userId,
      email: (claims as { email?: string }).email ?? null,
      profile,
      hasAccess: !!hasAccess,
      subscription: sub,
      lifetimePurchase: purchase,
    };
  });
