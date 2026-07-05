import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { plans } from "./plans";

const MUSCLEWIKI_BASE = "https://api.musclewiki.com/exercises";

// ---------- Public read ----------

export type VerificationSample = {
  name: string;
  saved: boolean;
  has_front: boolean;
  has_side: boolean;
};

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

function simplifyName(raw: string): string[] {
  const variants = new Set<string>();
  const add = (s: string) => {
    const t = s.trim().replace(/\s+/g, " ");
    if (t) variants.add(t);
  };

  add(raw);

  // Strip parenthetical descriptions: "foo (bar)" -> "foo"
  const noParen = raw.replace(/\([^)]*\)/g, " ").trim();
  add(noParen);

  // Strip em-dash / en-dash / hyphen modifiers: "foo — heavy" -> "foo"
  const noDashMod = noParen.replace(/\s*[—–-]\s*(heavy|light|weighted|standing|seated|hard|easy|advanced|beginner).*$/i, "");
  add(noDashMod);

  // Handle "A or B" - take the first alternative
  const orSplit = noDashMod.split(/\s+or\s+/i)[0];
  add(orSplit);

  // Strip descriptive modifier adjectives at any position
  const MODIFIERS = [
    "heavy", "light", "weighted", "assisted", "chair-assisted", "chair",
    "rear foot elevated", "front foot elevated",
    "standing", "seated", "kneeling", "incline", "decline",
    "advanced", "beginner", "modified",
  ];
  let cleaned = orSplit.toLowerCase();
  for (const m of MODIFIERS) {
    cleaned = cleaned.replace(new RegExp(`\\b${m}\\b`, "gi"), " ");
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  add(cleaned);

  // Equipment abbreviations
  const dbExpanded = cleaned.replace(/\bdb\b/gi, "dumbbell");
  add(dbExpanded);

  // Core movement fallbacks: last 1-3 words
  const words = dbExpanded.split(" ").filter(Boolean);
  if (words.length >= 2) add(words.slice(-2).join(" "));
  if (words.length >= 1) add(words.slice(-1).join(" "));

  // Hyphenation variants: "push-up" <-> "push up"
  const result: string[] = [];
  for (const v of variants) {
    result.push(v);
    if (v.includes("-")) result.push(v.replace(/-/g, " "));
  }
  // De-dupe preserving order
  return Array.from(new Set(result.map((s) => s.trim()).filter(Boolean)));
}

async function fetchCandidates(term: string, apiKey: string) {
  const url = `${MUSCLEWIKI_BASE}?search=${encodeURIComponent(term)}&limit=10`;
  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`);
  }
  const json = await res.json().catch(() => null);
  return extractCandidates(json);
}

async function fetchExerciseDetail(id: number | string, apiKey: string): Promise<any | null> {
  const res = await fetch(`${MUSCLEWIKI_BASE}/${encodeURIComponent(String(id))}`, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

function extractVideoUrls(detail: any): { front: string | null; side: string | null } {
  const videos: any[] = Array.isArray(detail?.videos) ? detail.videos : [];
  const pickAngle = (angle: string) => {
    const male = videos.find(
      (v) => v?.angle === angle && v?.gender === "male" && typeof v?.url === "string" && v.url,
    );
    if (male) return male.url as string;
    const any = videos.find(
      (v) => v?.angle === angle && typeof v?.url === "string" && v.url,
    );
    return any ? (any.url as string) : null;
  };
  return { front: pickAngle("front"), side: pickAngle("side") };
}

export const syncMuscleWikiMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { onlyMissing?: boolean } | undefined) => d ?? {})
  .handler(async ({ data }): Promise<SyncResult> => {
    const onlyMissing = !!data.onlyMissing;
    const allNames = collectExerciseNames();
    const result: SyncResult = {
      total: allNames.length,
      matched: 0,
      upserted: 0,
      unmatched: [],
      errors: [],
    };

    try {
      const apiKey = process.env.MUSCLEWIKI_API_KEY;
      if (!apiKey) {
        result.errors.push({ name: "*", error: "MUSCLEWIKI_API_KEY is not configured." });
        return result;
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // If onlyMissing, look up already-saved exercise_name rows and skip them
      let names = allNames;
      let existingCount = 0;
      if (onlyMissing) {
        const { data: existing, error: exErr } = await supabaseAdmin
          .from("exercise_media")
          .select("exercise_name, video_url_front, video_url_side");
        if (exErr) {
          result.errors.push({ name: "*", error: exErr.message });
          return result;
        }
        const haveVideo = new Set(
          (existing ?? [])
            .filter((r: any) => r.video_url_front || r.video_url_side)
            .map((r: any) => r.exercise_name as string),
        );
        existingCount = haveVideo.size;
        names = allNames.filter((n) => !haveVideo.has(n));
        result.matched = existingCount;
        result.upserted = existingCount;
      }

      for (const name of names) {
        try {
          const searchTerms = simplifyName(name);
          let best: { score: number; row: any } | null = null;

          for (const term of searchTerms) {
            const candidates = await fetchCandidates(term, apiKey);
            if (candidates.length === 0) continue;
            for (const c of candidates) {
              const candName = pickField(c, ["name", "exercise_name", "title"]);
              if (!candName) continue;
              const score = scoreMatch(term, candName);
              if (!best || score > best.score) best = { score, row: c };
            }
            if (best && best.score >= 0.6) break; // good enough, stop trying variants
          }

          if (!best || best.score < 0.4) {
            result.unmatched.push(name);
            continue;
          }

          const c = best.row;
          const candId = c?.id;
          let detail: any = c;
          if (candId != null) {
            const fetched = await fetchExerciseDetail(candId, apiKey);
            if (fetched) detail = fetched;
          }

          const { front, side } = extractVideoUrls(detail);
          const stepsArr: string[] = Array.isArray(detail?.steps) ? detail.steps : [];
          const instructions =
            stepsArr.length > 0
              ? stepsArr.join("\n")
              : pickField(detail, ["instructions", "description", "how_to"]);
          const primaryMuscles: string[] = Array.isArray(detail?.primary_muscles)
            ? detail.primary_muscles
            : [];
          const muscle =
            primaryMuscles[0] ?? pickField(detail, ["muscle_group", "primary_muscle", "muscle"]);
          const equipment = pickField(detail, ["category", "equipment", "equipment_name", "gear"]);

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
    } catch (e) {
      result.errors.push({ name: "*", error: e instanceof Error ? e.message : String(e) });
      return result;
    }
  });
