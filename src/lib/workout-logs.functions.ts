import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const logWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      exercise_name: string;
      weight?: number | null;
      sets?: number | null;
      reps?: number | null;
      reps_completed?: number | null;
      difficulty?: "too_easy" | "just_right" | "too_hard" | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error, data: row } = await supabase
      .from("workout_logs")
      .insert({
        user_id: userId,
        exercise_name: data.exercise_name,
        weight: data.weight ?? null,
        sets: data.sets ?? null,
        reps: data.reps ?? null,
        reps_completed: data.reps_completed ?? null,
        difficulty: data.difficulty ?? null,
      })
      .select("id, exercise_name, weight, sets, reps, reps_completed, difficulty, logged_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getLatestLogsByExercise = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("workout_logs")
      .select("exercise_name, weight, sets, reps, logged_at")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const latest: Record<
      string,
      { weight: number | null; sets: number | null; reps: number | null; logged_at: string }
    > = {};
    for (const row of data ?? []) {
      if (!latest[row.exercise_name]) {
        latest[row.exercise_name] = {
          weight: row.weight as number | null,
          sets: row.sets,
          reps: row.reps,
          logged_at: row.logged_at,
        };
      }
    }
    return latest;
  });

export const getAllLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("workout_logs")
      .select("exercise_name, weight, sets, reps, logged_at")
      .eq("user_id", userId)
      .order("logged_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
