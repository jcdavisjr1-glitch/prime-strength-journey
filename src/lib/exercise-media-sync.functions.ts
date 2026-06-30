import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { plans } from "./plans";

const MUSCLEWIKI_BASE = "https://api.musclewiki.com/exercises";

// ---------- Public read ----------

export type ExerciseMediaRow = {
  exercise_name: string;
  video_url_front: string | null;
  video_url_side: string | null;
  instructions: string | null;
  muscle_group: string | null;
  equipment: string | null;
};

export const listExerciseMedia = createServerFn({ method: "GET" }).handler(
  async (): Promise<ExerciseMediaRow[]> => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await sb
      .from("exercise_media")
      .select(
        "exercise_name, video_url_front, video_url_side, instructions, muscle_group, equipment",
      );
    if (error) throw new Error(error.message);
    return (data ?? []) as ExerciseMediaRow[];
  },
);

// ---------- Sync (auth required) ----------

export type SyncResult = {
  total: number;
  matched: number;
  upserted: number;
  unmatched: string[];
  errors: { name: string; error: string }[];
};

function collectExerciseNames(): string[] {
  const names = new Set<string>();
  const levels = Object.values(plans) as Array<(typeof plans)["beginner"]>;
  for (const level of levels) {
    const equips = Object.values(level) as Array<(typeof level)["gym"]>;
    for (const equip of equips) {
      const days = Object.values(equip) as Array<(typeof equip)["day1"]>;
      for (const day of days) {
        for (const ex of day.exercises) names.add(ex.name);
      }
    }
  }
  return Array.from(names).sort();
}

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !["the", "a", "an", "and", "with", "of"].includes(t));
}

function scoreMatch(query: string, candidate: string): number {
  const q = new Set(normalize(query));
  const c = new Set(normalize(candidate));
  if (q.size === 0 || c.size === 0) return 0;
  let overlap = 0;
  for (const t of q) if (c.has(t)) overlap += 1;
  // Jaccard-ish, biased toward query coverage
  const coverage = overlap / q.size;
  const precision = overlap / c.size;
  return coverage * 0.7 + precision * 0.3;
}

function pickField(obj: any, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function extractCandidates(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.exercises)) return payload.exercises;
  return [];
}

export const syncMuscleWikiMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<SyncResult> => {
    const apiKey = process.env.MUSCLEWIKI_API_KEY;
    if (!apiKey) throw new Error("MUSCLEWIKI_API_KEY is not configured.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const names = collectExerciseNames();

    const result: SyncResult = {
      total: names.length,
      matched: 0,
      upserted: 0,
      unmatched: [],
      errors: [],
    };

    for (const name of names) {
      try {
        const url = `${MUSCLEWIKI_BASE}?name=${encodeURIComponent(name)}`;
        const res = await fetch(url, {
          headers: { "X-API-Key": apiKey, Accept: "application/json" },
        });

        if (!res.ok) {
          result.errors.push({ name, error: `HTTP ${res.status}` });
          continue;
        }

        const json = await res.json().catch(() => null);
        const candidates = extractCandidates(json);
        if (candidates.length === 0) {
          result.unmatched.push(name);
          continue;
        }

        let best: { score: number; row: any } | null = null;
        for (const c of candidates) {
          const candName = pickField(c, ["name", "exercise_name", "title"]);
          if (!candName) continue;
          const score = scoreMatch(name, candName);
          if (!best || score > best.score) best = { score, row: c };
        }

        if (!best || best.score < 0.4) {
          result.unmatched.push(name);
          continue;
        }

        const c = best.row;
        const front = pickField(c, [
          "video_url_front",
          "videoURL",
          "video_url",
          "male_video",
          "front_video",
          "video",
        ]);
        const side = pickField(c, [
          "video_url_side",
          "side_video",
          "videoURL_side",
          "video_side",
        ]);
        const instructions = pickField(c, [
          "instructions",
          "description",
          "steps",
          "how_to",
        ]);
        const muscle = pickField(c, ["muscle_group", "primary_muscle", "muscle", "category"]);
        const equipment = pickField(c, ["equipment", "equipment_name", "gear"]);

        const { error: upErr } = await supabaseAdmin.from("exercise_media").upsert(
          {
            exercise_name: name,
            video_url_front: front,
            video_url_side: side,
            instructions,
            muscle_group: muscle,
            equipment,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: "exercise_name" },
        );

        if (upErr) {
          result.errors.push({ name, error: upErr.message });
          continue;
        }

        result.matched += 1;
        result.upserted += 1;
      } catch (e) {
        result.errors.push({ name, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return result;
  });
