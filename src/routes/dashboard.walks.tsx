import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfileAndAccess } from "@/lib/profile.functions";
import { getMyWalkingLogs, logWalk } from "@/lib/walking-logs.functions";
import { Footprints } from "lucide-react";

export const Route = createFileRoute("/dashboard/walks")({
  ssr: false,
  head: () => ({ meta: [{ title: "Walks — FortyStrong" }] }),
  component: WalksPage,
});

type Walk = {
  id: string;
  duration_minutes: number;
  logged_date: string;
  notes: string | null;
  created_at: string;
};

const QUICK_DURATIONS = [10, 15, 20, 30, 45];

function todayStr() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function startOfWeekMonday(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

function isoDate(d: Date) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

function WalksPage() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const fetchProfile = useServerFn(getMyProfileAndAccess);
  const fetchWalks = useServerFn(getMyWalkingLogs);
  const submitWalk = useServerFn(logWalk);

  const [goal, setGoal] = useState<number>(60);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [date, setDate] = useState<string>(todayStr());
  const [duration, setDuration] = useState<number>(20);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchProfile({}), fetchWalks({})])
      .then(([p, w]) => {
        setGoal(p.profile?.weekly_walking_goal_minutes ?? 60);
        setWalks(w as Walk[]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [user, fetchProfile, fetchWalks]);

  const weekStart = useMemo(() => startOfWeekMonday(), []);
  const weekStartStr = useMemo(() => isoDate(weekStart), [weekStart]);

  const weekTotal = useMemo(
    () => walks.filter((w) => w.logged_date >= weekStartStr).reduce((sum, w) => sum + w.duration_minutes, 0),
    [walks, weekStartStr]
  );

  const pct = goal > 0 ? Math.min(100, Math.round((weekTotal / goal) * 100)) : 0;
  const goalHit = goal > 0 && weekTotal >= goal;
  const remaining = Math.max(0, goal - weekTotal);

  const last30Days = useMemo(() => {
    const days: { date: string; minutes: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = isoDate(d);
      const total = walks.filter((w) => w.logged_date === ds).reduce((s, w) => s + w.duration_minutes, 0);
      days.push({ date: ds, minutes: total });
    }
    return days;
  }, [walks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const effectiveDuration = customDuration.trim() ? Number(customDuration) : duration;
    if (!effectiveDuration || effectiveDuration <= 0) {
      setError("Enter a valid duration.");
      return;
    }
    setSubmitting(true);
    try {
      const row = await submitWalk({
        data: {
          duration_minutes: effectiveDuration,
          logged_date: date,
          notes: notes || null,
        },
      });
      setWalks((prev) => [row as Walk, ...prev]);
      setNotes("");
      setCustomDuration("");
      setDuration(20);
      setDate(todayStr());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save walk.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || !loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm flex items-center gap-2">
        <Footprints className="h-4 w-4" /> Walks
      </div>
      <h1 className="mt-3 font-display uppercase text-4xl md:text-5xl">Move on your off days.</h1>

      {/* This Week */}
      <div className="mt-10 p-6 md:p-8 rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">This week</div>
            <div className="mt-2 font-display uppercase text-3xl md:text-4xl">
              {weekTotal} <span className="text-muted-foreground text-2xl">/ {goal} min</span>
            </div>
            <div className="mt-2 text-sm">
              {goalHit ? (
                <span className="text-primary font-display uppercase tracking-widest">Goal hit! 🎉</span>
              ) : (
                <span className="text-muted-foreground">{remaining} minutes to go</span>
              )}
            </div>
          </div>
          <div className="hidden md:block font-display uppercase text-5xl text-primary tabular-nums">{pct}%</div>
        </div>
        <div className="mt-5 h-3 w-full rounded-full bg-background overflow-hidden border border-border">
          <div
            className={`h-full transition-[width] duration-500 ${goalHit ? "bg-primary" : "bg-primary/70"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Log a Walk */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 p-6 md:p-8 rounded-lg border border-border bg-surface"
      >
        <h2 className="font-display uppercase text-2xl">Log a walk</h2>

        <div className="mt-6 grid gap-5">
          <div>
            <label className="font-display tracking-widest uppercase text-xs text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full md:w-auto px-4 py-3 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-display tracking-widest uppercase text-xs text-muted-foreground">Duration</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_DURATIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setDuration(m);
                    setCustomDuration("");
                  }}
                  className={`px-4 py-3 min-w-[64px] rounded-sm font-display uppercase tracking-wider text-sm border transition-colors ${
                    !customDuration && duration === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary"
                  }`}
                >
                  {m} min
                </button>
              ))}
              <input
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Custom"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-28 px-4 py-3 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="font-display tracking-widest uppercase text-xs text-muted-foreground">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Felt great. Took the dog."
              className="mt-2 w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {error && <div className="text-sm text-primary">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-8 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Log walk"}
          </button>
        </div>
      </form>

      {/* History */}
      <div className="mt-10">
        <h2 className="font-display uppercase text-2xl">Last 30 days</h2>
        <div className="mt-4 grid grid-cols-6 sm:grid-cols-10 gap-2">
          {last30Days.map((d) => {
            const has = d.minutes > 0;
            const intensity = Math.min(1, d.minutes / 45);
            return (
              <div
                key={d.date}
                title={`${d.date} — ${d.minutes} min`}
                className={`aspect-square rounded-sm border flex flex-col items-center justify-center text-[10px] font-display uppercase tracking-wider ${
                  has ? "border-primary text-primary-foreground" : "border-border text-muted-foreground/60 bg-background"
                }`}
                style={
                  has
                    ? { backgroundColor: `rgba(192, 57, 43, ${0.35 + intensity * 0.55})` }
                    : undefined
                }
              >
                <span>{d.date.slice(8, 10)}</span>
                {has && <span className="mt-0.5">{d.minutes}m</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
