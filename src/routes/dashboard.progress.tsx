import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getAllLogs } from "@/lib/workout-logs.functions";
import { getBlockHistory, type TrainingBlock } from "@/lib/training-blocks.functions";
import { Flame, ArrowUp, ArrowDown, Minus } from "lucide-react";

export const Route = createFileRoute("/dashboard/progress")({
  ssr: false,
  head: () => ({ meta: [{ title: "Progress — FortyStrong" }] }),
  component: ProgressPage,
});

type Log = {
  exercise_name: string;
  weight: number | null;
  sets: number | null;
  reps: number | null;
  logged_at: string;
};

function ProgressPage() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const fetchLogs = useServerFn(getAllLogs);
  const fetchBlocks = useServerFn(getBlockHistory);
  const [logs, setLogs] = useState<Log[] | null>(null);
  const [blocks, setBlocks] = useState<TrainingBlock[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchLogs({})
      .then((rows) => {
        setLogs(rows as Log[]);
        const first = (rows as Log[]).find((r) => r.weight != null);
        if (first) setSelected(first.exercise_name);
      })
      .catch(() => setLogs([]));
    fetchBlocks({})
      .then(setBlocks)
      .catch(() => {});
  }, [user, fetchLogs, fetchBlocks, navigate]);
  

  const exercises = useMemo(() => {
    if (!logs) return [];
    return Array.from(new Set(logs.map((l) => l.exercise_name)));
  }, [logs]);

  const chartData = useMemo(() => {
    if (!logs || !selected) return [];
    return logs
      .filter((l) => l.exercise_name === selected && l.weight != null)
      .map((l) => ({
        date: new Date(l.logged_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        weight: Number(l.weight),
      }));
  }, [logs, selected]);

  const streak = useMemo(() => {
    if (!logs) return 0;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const days = new Set<string>();
    for (const l of logs) {
      const t = new Date(l.logged_at).getTime();
      if (t >= cutoff) days.add(new Date(l.logged_at).toDateString());
    }
    return days.size;
  }, [logs]);

  if (loading || !user || logs === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        Progress
      </div>
      <h1 className="mt-4 font-display uppercase text-4xl md:text-6xl">
        Your <span className="text-primary">numbers</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border border-border bg-surface rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Flame className="h-5 w-5" />
            <span className="font-display uppercase tracking-widest text-xs">
              30-day streak
            </span>
          </div>
          <div className="mt-3 font-display text-5xl text-foreground">{streak}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            days trained in the last 30
          </div>
        </div>
        <div className="md:col-span-2 p-5 border border-border bg-surface rounded-lg">
          <div className="font-display uppercase tracking-widest text-xs text-muted-foreground">
            Total logs
          </div>
          <div className="mt-3 font-display text-5xl text-foreground">
            {logs.length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="font-display uppercase tracking-[0.3em] text-primary text-xs">
              Strength curve
            </div>
            <h2 className="mt-2 font-display uppercase text-2xl">
              Weight over time
            </h2>
          </div>
          {exercises.length > 0 && (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="bg-surface border border-border rounded px-3 py-2 text-foreground font-display uppercase tracking-wider text-xs"
            >
              {exercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-6 h-80 p-4 border border-border bg-surface rounded-lg">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-muted-foreground text-sm max-w-sm">
                {logs.length === 0
                  ? "Log a few sets from your plan to see your progress here."
                  : "No weight data for this exercise yet."}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--primary)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-12">
        <div className="font-display uppercase tracking-[0.3em] text-primary text-xs">
          Your journey
        </div>
        <h2 className="mt-2 font-display uppercase text-2xl">Block history</h2>
        {blocks.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Your first training block is in progress. History appears as you complete blocks.
          </p>
        ) : (
          <ol className="mt-6 space-y-3">
            {blocks.map((b) => {
              const start = new Date(b.start_date);
              const end = b.end_date ? new Date(b.end_date) : new Date();
              const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
              const outcomeLabel =
                b.status === "active"
                  ? "In progress"
                  : b.status === "deload"
                    ? "Deload week"
                    : b.outcome === "level_up"
                      ? "Leveled up"
                      : b.outcome === "level_down"
                        ? "Stepped back"
                        : "Stayed on level";
              const OutcomeIcon =
                b.outcome === "level_up"
                  ? ArrowUp
                  : b.outcome === "level_down"
                    ? ArrowDown
                    : Minus;
              return (
                <li
                  key={b.id}
                  className="p-4 border border-border bg-surface rounded-lg flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-display uppercase tracking-widest text-xs text-primary">
                      Block {b.block_number} · {cap(b.fitness_level)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {days} day{days === 1 ? "" : "s"} · {cap(b.equipment_type)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-display uppercase tracking-widest text-xs text-foreground">
                    <OutcomeIcon className="h-4 w-4 text-primary" />
                    <span>{outcomeLabel}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
