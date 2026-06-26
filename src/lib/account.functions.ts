import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return {
      userId: context.userId,
      email: (context.claims as { email?: string }).email ?? null,
      fullName:
        ((context.claims as { user_metadata?: { full_name?: string } }).user_metadata?.full_name) ??
        null,
    };
  });
