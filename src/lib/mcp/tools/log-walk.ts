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
  name: "log_walk",
  title: "Log a walk",
  description: "Record a walk (duration in minutes on a given date) for the signed-in user.",
  inputSchema: {
    duration_minutes: z.number().int().positive().describe("Walk length in minutes."),
    logged_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .describe("Date walked (YYYY-MM-DD)."),
    notes: z.string().trim().max(500).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("walking_logs")
      .insert({
        user_id: ctx.getUserId(),
        duration_minutes: input.duration_minutes,
        logged_date: input.logged_date,
        notes: input.notes?.trim() ? input.notes.trim() : null,
      })
      .select("id, duration_minutes, logged_date, notes, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Logged ${data.duration_minutes} min walk on ${data.logged_date}.` }],
      structuredContent: { walk: data },
    };
  },
});
