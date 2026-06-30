import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Recommendation = {
  exercise_name: string;
  recommended_weight: number | null;
  recommendation_reason: string;
  applied: boolean;
  based_on_session_date: string;
};

export const getMyRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("progression_recommendations")
      .select(
        "exercise_name, recommended_weight, recommendation_reason, applied, based_on_session_date",
      )
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const map: Record<string, Recommendation> = {};
    for (const r of (data ?? []) as Recommendation[]) {
      map[r.exercise_name] = r;
    }
    return map;
  });

export const markRecommendationApplied = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { exercise_name: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("progression_recommendations")
      .update({ applied: true })
      .eq("user_id", userId)
      .eq("exercise_name", data.exercise_name);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
