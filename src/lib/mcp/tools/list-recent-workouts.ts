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
  name: "list_recent_workouts",
  title: "List recent workouts",
  description: "Return the signed-in user's most recent strength-training sets, newest first.",
  inputSchema: {
    limit: z.number().int().positive().max(200).optional().describe("Max sets to return. Default 20."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("workout_logs")
      .select("exercise_name, weight, sets, reps, reps_completed, difficulty, logged_at")
      .eq("user_id", ctx.getUserId())
      .order("logged_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Found ${data?.length ?? 0} sets.` }],
      structuredContent: { logs: data ?? [] },
    };
  },
});
