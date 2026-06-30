import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TrainingBlock = {
  id: string;
  block_number: number;
  start_date: string;
  end_date: string | null;
  fitness_level: string;
  equipment_type: string;
  status: "active" | "deload" | "complete";
  review_score: number | null;
  outcome: "stay" | "level_up" | "level_down" | "swap_exercises" | null;
};

export const getActiveBlock = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("training_blocks")
      .select(
        "id, block_number, start_date, end_date, fitness_level, equipment_type, status, review_score, outcome",
      )
      .eq("user_id", userId)
      .in("status", ["active", "deload"])
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as TrainingBlock | null) ?? null;
  });

export const getBlockHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("training_blocks")
      .select(
        "id, block_number, start_date, end_date, fitness_level, equipment_type, status, review_score, outcome",
      )
      .eq("user_id", userId)
      .order("block_number", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as TrainingBlock[];
  });
