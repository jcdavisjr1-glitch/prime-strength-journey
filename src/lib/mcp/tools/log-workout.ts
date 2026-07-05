import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "log_workout",
  title: "Log a workout set",
  description:
    "Record a single strength-training set for the signed-in FortyStrong user (exercise, weight, sets, reps, and how it felt).",
  inputSchema: {
    exercise_name: z.string().trim().min(1).describe("Exercise name, e.g. 'Back squat'."),
    weight: z.number().nonnegative().optional().describe("Weight used, in the user's unit."),
    sets: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional().describe("Target reps for the set."),
    reps_completed: z.number().int().nonnegative().optional().describe("Reps the user actually completed."),
    difficulty: z
      .enum(["too_easy", "just_right", "too_hard"])
      .optional()
      .describe("How the set felt overall."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("workout_logs")
      .insert({
        user_id: ctx.getUserId(),
        exercise_name: input.exercise_name,
        weight: input.weight ?? null,
        sets: input.sets ?? null,
        reps: input.reps ?? null,
        reps_completed: input.reps_completed ?? null,
        difficulty: input.difficulty ?? null,
      })
      .select("id, exercise_name, weight, sets, reps, reps_completed, difficulty, logged_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${data.exercise_name}.` }],
      structuredContent: { log: data },
    };
  },
});
