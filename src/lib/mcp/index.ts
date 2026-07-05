import { auth, defineMcp } from "@lovable.dev/mcp-js";
import logWorkoutTool from "./tools/log-workout";
import listRecentWorkoutsTool from "./tools/list-recent-workouts";
import logWalkTool from "./tools/log-walk";
import listRecentWalksTool from "./tools/list-recent-walks";

// See knowledge: OAuth issuer must be the direct Supabase host, and the project ref
// is read from a Vite-inlined literal to survive the manifest-extract eval + publish.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "fortystrong-mcp",
  title: "FortyStrong",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in FortyStrong user: log strength-training sets and walks, and review recent activity. All tools operate as the connected user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [logWorkoutTool, listRecentWorkoutsTool, logWalkTool, listRecentWalksTool],
});
