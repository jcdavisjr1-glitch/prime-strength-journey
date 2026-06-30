import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyWalkingLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("walking_logs")
      .select("id, duration_minutes, logged_date, notes, created_at")
      .eq("user_id", userId)
      .gte("logged_date", sinceStr)
      .order("logged_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
  });

export const logWalk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { duration_minutes: number; logged_date: string; notes?: string | null }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const duration = Math.round(Number(data.duration_minutes));
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("Duration must be greater than 0.");
    }
    const { data: row, error } = await supabase
      .from("walking_logs")
      .insert({
        user_id: userId,
        duration_minutes: duration,
        logged_date: data.logged_date,
        notes: data.notes?.trim() ? data.notes.trim() : null,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const updateWalkingGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { weekly_walking_goal_minutes: number }) => d)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const goal = Math.round(Number(data.weekly_walking_goal_minutes));
    if (!Number.isFinite(goal) || goal < 0 || goal > 10000) {
      throw new Error("Goal must be between 0 and 10000 minutes.");
    }
    const { error } = await supabase
      .from("profiles")
      .update({ weekly_walking_goal_minutes: goal })
      .eq("id", userId);
    if (error) throw error;
    return { weekly_walking_goal_minutes: goal };
  });
