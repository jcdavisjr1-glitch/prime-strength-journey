import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "exercise-videos";

function storagePrefix(): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
}

function normalizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + ".mp4"
  );
}

export type PendingListResult = {
  pending: string[];
  alreadyDone: number;
  total: number;
};

export const listPendingVideoDownloads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<PendingListResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("exercise_media")
      .select("exercise_name, video_url_front");
    if (error) throw new Error(error.message);
    const prefix = storagePrefix();
    const rows = data ?? [];
    const withVideo = rows.filter((r) => !!r.video_url_front);
    const pending = withVideo
      .filter((r) => !r.video_url_front!.startsWith(prefix))
      .map((r) => r.exercise_name as string);
    return {
      pending,
      alreadyDone: withVideo.length - pending.length,
      total: withVideo.length,
    };
  });

export type DownloadResult = {
  name: string;
  ok: boolean;
  url?: string;
  error?: string;
};

export const downloadExerciseVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string }) => {
    if (!d?.name || typeof d.name !== "string") throw new Error("name is required");
    return { name: d.name };
  })
  .handler(async ({ data }): Promise<DownloadResult> => {
    const name = data.name;
    try {
      const apiKey = process.env.MUSCLEWIKI_API_KEY;
      if (!apiKey) return { name, ok: false, error: "MUSCLEWIKI_API_KEY not configured" };

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: row, error: rowErr } = await supabaseAdmin
        .from("exercise_media")
        .select("exercise_name, video_url_front, video_url_side")
        .eq("exercise_name", name)
        .maybeSingle();
      if (rowErr) return { name, ok: false, error: rowErr.message };
      if (!row) return { name, ok: false, error: "row not found" };

      const source = row.video_url_front || row.video_url_side;
      if (!source) return { name, ok: false, error: "no source video URL" };

      const prefix = storagePrefix();
      if (row.video_url_front && row.video_url_front.startsWith(prefix)) {
        return { name, ok: true, url: row.video_url_front };
      }

      // Fetch from MuscleWiki with server-side API key
      const upstream = await fetch(source, {
        headers: { "X-API-Key": apiKey, Accept: "video/mp4,video/*;q=0.9,*/*;q=0.8" },
      });
      if (!upstream.ok) {
        const body = await upstream.text().catch(() => "");
        return {
          name,
          ok: false,
          error: `upstream HTTP ${upstream.status} ${body.slice(0, 120)}`,
        };
      }
      const contentType = upstream.headers.get("content-type") || "video/mp4";
      const arrayBuf = await upstream.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      if (bytes.byteLength === 0) return { name, ok: false, error: "empty video body" };

      const filename = normalizeFilename(name);
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filename, bytes, {
          contentType,
          upsert: true,
          cacheControl: "31536000",
        });
      if (upErr) return { name, ok: false, error: `upload: ${upErr.message}` };

      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filename);
      const publicUrl = pub.publicUrl;

      const { error: updErr } = await supabaseAdmin
        .from("exercise_media")
        .update({ video_url_front: publicUrl, fetched_at: new Date().toISOString() })
        .eq("exercise_name", name);
      if (updErr) return { name, ok: false, error: `update: ${updErr.message}` };

      return { name, ok: true, url: publicUrl };
    } catch (e) {
      return { name, ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  });
