import { createFileRoute } from "@tanstack/react-router";

// Public same-origin proxy for MuscleWiki video streams.
// The MuscleWiki stream endpoints require an X-API-Key header server-side,
// which a browser <video src> tag cannot attach — so we fetch here with the
// key and stream the MP4 body back to the client, forwarding Range for scrub.

export const Route = createFileRoute("/api/public/exercise-video")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "Range, Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        }),
      HEAD: (ctx) => handle(ctx.request, true),
      GET: (ctx) => handle(ctx.request, false),
    },
  },
});

async function handle(request: Request, headOnly: boolean): Promise<Response> {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const angle = (url.searchParams.get("angle") || "front").toLowerCase();
  if (!name) {
    return new Response("Missing name", { status: 400 });
  }

  const apiKey = process.env.MUSCLEWIKI_API_KEY;
  if (!apiKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await sb
    .from("exercise_media")
    .select("video_url_front, video_url_side")
    .eq("exercise_name", name)
    .maybeSingle();

  if (error || !data) {
    return new Response("Not found", { status: 404 });
  }

  const primary = angle === "side" ? data.video_url_side : data.video_url_front;
  const fallback = angle === "side" ? data.video_url_front : data.video_url_side;
  const target = primary || fallback;
  if (!target) {
    return new Response("No video URL", { status: 404 });
  }

  const upstreamHeaders: Record<string, string> = {
    "X-API-Key": apiKey,
    Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8",
  };
  const range = request.headers.get("range");
  if (range) upstreamHeaders["Range"] = range;

  const upstream = await fetch(target, {
    method: headOnly ? "HEAD" : "GET",
    headers: upstreamHeaders,
  });

  const respHeaders = new Headers();
  const passthrough = [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "last-modified",
    "etag",
  ];
  for (const h of passthrough) {
    const v = upstream.headers.get(h);
    if (v) respHeaders.set(h, v);
  }
  if (!respHeaders.has("content-type")) respHeaders.set("content-type", "video/mp4");
  if (!respHeaders.has("accept-ranges")) respHeaders.set("accept-ranges", "bytes");
  respHeaders.set("cache-control", "public, max-age=86400");
  respHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(headOnly ? null : upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}
