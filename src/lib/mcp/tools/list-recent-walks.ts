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
  name: "list_recent_walks",
  title: "List recent walks",
  description: "Return the signed-in user's walks from the last 60 days, newest first.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const since = new Date();
    since.setDate(since.getDate() - 60);
    const { data, error } = await supabaseForUser(ctx)
      .from("walking_logs")
      .select("id, duration_minutes, logged_date, notes, created_at")
      .eq("user_id", ctx.getUserId())
      .gte("logged_date", since.toISOString().slice(0, 10))
      .order("logged_date", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Found ${data?.length ?? 0} walks.` }],
      structuredContent: { walks: data ?? [] },
    };
  },
});
