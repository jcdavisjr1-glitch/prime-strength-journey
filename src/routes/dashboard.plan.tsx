import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfileAndAccess } from "@/lib/profile.functions";
import {
  getLatestLogsByExercise,
  logWorkout,
} from "@/lib/workout-logs.functions";
import { plans, type Exercise } from "@/lib/plans";
import {
  getMyRecommendations,
  markRecommendationApplied,
  type Recommendation,
} from "@/lib/progression.functions";
import { CheckCircle2, X, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard/plan")({
  ssr: false,
  head: () => ({ meta: [{ title: "My Plan — FortyStrong" }] }),
  component: MyPlan,
});

type Data = Awaited<ReturnType<typeof getMyProfileAndAccess>>;
type LatestLogs = Awaited<ReturnType<typeof getLatestLogsByExercise>>;

function MyPlan() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const fetchData = useServerFn(getMyProfileAndAccess);
  const fetchLatest = useServerFn(getLatestLogsByExercise);
  const fetchRecs = useServerFn(getMyRecommendations);
  const markApplied = useServerFn(markRecommendationApplied);
  const submitLog = useServerFn(logWorkout);
  const [data, setData] = useState<Data | null>(null);
  const [latest, setLatest] = useState<LatestLogs>({});
  const [recs, setRecs] = useState<Record<string, Recommendation>>({});
  const [fetched, setFetched] = useState(false);
  const [activeDay, setActiveDay] = useState<"day1" | "day2">("day1");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [logging, setLogging] = useState<Exercise | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchData({})
      .then((d) => {
        setData(d);
        setFetched(true);
        if (d.profile && !d.profile.onboarding_completed) {
          navigate({ to: "/onboarding" });
        }
      })
      .catch(() => setFetched(true));
    fetchLatest({})
      .then(setLatest)
      .catch(() => {});
    fetchRecs({})
      .then(setRecs)
      .catch(() => {});
  }, [user, fetchData, fetchLatest, fetchRecs, navigate]);

  const refreshAfterLog = () => {
    fetchLatest({})
      .then(setLatest)
      .catch(() => {});
    fetchRecs({})
      .then(setRecs)
      .catch(() => {});
  };

  if (loading || !user || !fetched) return <LoadingState />;
  if (!data?.hasAccess) return <NoPlanState />;

  const level = data.profile?.fitness_level ?? "beginner";
  const equipment = data.profile?.equipment_type ?? "gym";
  const validLevels = ["beginner", "intermediate", "advanced"] as const;
  const validEquipment = ["gym", "home", "bodyweight"] as const;
  const safeLevel = validLevels.includes(level as (typeof validLevels)[number])
    ? (level as keyof typeof plans)
    : "beginner";
  const safeEquipment = validEquipment.includes(
    equipment as (typeof validEquipment)[number],
  )
    ? (equipment as "gym" | "home" | "bodyweight")
    : "gym";

  const plan = plans[safeLevel][safeEquipment];
  const day = plan[activeDay];

  const toggleExercise = (name: string) =>
    setCompleted((p) => ({ ...p, [name]: !p[name] }));

  const completedCount = day.exercises.filter((ex) => completed[ex.name]).length;
  const progress = Math.round((completedCount / day.exercises.length) * 100);

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        My Plan
      </div>
      <h1 className="mt-4 font-display uppercase text-4xl md:text-6xl">{day.name}</h1>
      <p className="mt-2 text-muted-foreground">{day.focus}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center px-3 py-1.5 border border-primary/40 bg-primary/10 rounded-full font-display tracking-widest uppercase text-[10px] text-primary">
          {cap(safeLevel)} · {cap(safeEquipment)}
        </div>
        <div className="inline-flex items-center px-3 py-1.5 border border-border bg-surface rounded-full font-display tracking-widest uppercase text-[10px] text-muted-foreground">
          {progress}% complete
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {(["day1", "day2"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`py-3 px-4 text-center font-display uppercase tracking-widest text-sm border transition-all ${
              activeDay === d
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {d === "day1" ? "Day A" : "Day B"}
          </button>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {day.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.name + index}
            exercise={exercise}
            index={index}
            completed={!!completed[exercise.name]}
            lastLog={latest[exercise.name]}
            recommendation={recs[exercise.name]}
            onToggle={() => toggleExercise(exercise.name)}
            onLog={() => setLogging(exercise)}
          />
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Alternate Day A and Day B with at least one rest day between lifting sessions.
        Outside lifting days, walk 20–30 minutes.
      </p>

      {logging && (
        <LogModal
          exercise={logging}
          recommendedWeight={recs[logging.name]?.recommended_weight ?? null}
          onClose={() => setLogging(null)}
          onSave={async (payload) => {
            const name = logging.name;
            await submitLog({ data: { exercise_name: name, ...payload } });
            try {
              await markApplied({ data: { exercise_name: name } });
            } catch {
              /* ignore */
            }
            setLogging(null);
            refreshAfterLog();
            window.dispatchEvent(new CustomEvent("fs:logged", { detail: { name } }));
          }}
        />
      )}
    </section>
  );
}

function ExerciseCard({
  exercise,
  index,
  completed,
  lastLog,
  recommendation,
  onToggle,
  onLog,
}: {
  exercise: Exercise;
  index: number;
  completed: boolean;
  lastLog?: {
    weight: number | null;
    sets: number | null;
    reps: number | null;
    reps_completed: number | null;
    difficulty: "too_easy" | "just_right" | "too_hard" | null;
  };
  recommendation?: Recommendation;
  onToggle: () => void;
  onLog: () => void;
}) {
  const [justLogged, setJustLogged] = useState(false);
  const handleLog = () => {
    onLog();
  };
  // Expose a way for parent to flash "Logged ✓" — using a custom event hook
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ name: string }>;
      if (ce.detail?.name === exercise.name) {
        setJustLogged(true);
        setTimeout(() => setJustLogged(false), 2000);
      }
    };
    window.addEventListener("fs:logged", handler);
    return () => window.removeEventListener("fs:logged", handler);
  }, [exercise.name]);

  const difficultyEmoji =
    lastLog?.difficulty === "too_easy"
      ? "😤"
      : lastLog?.difficulty === "too_hard"
        ? "😮‍💨"
        : lastLog?.difficulty === "just_right"
          ? "💪"
          : null;

  return (
    <div
      className={`group p-4 md:p-5 rounded-lg border transition-all ${
        completed ? "bg-primary/5 border-primary/30" : "bg-surface border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          aria-label="Mark complete"
          className={`mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
            completed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground hover:border-primary"
          }`}
        >
          {completed && <CheckCircle2 className="h-4 w-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
            <h3
              className={`font-display uppercase text-lg ${
                completed ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {index + 1}. {exercise.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 font-display uppercase text-xs tracking-wider text-muted-foreground">
              <span className="px-2 py-1 bg-background rounded border border-border">
                {exercise.sets} sets
              </span>
              <span className="px-2 py-1 bg-background rounded border border-border">
                {exercise.reps}
              </span>
              <span className="px-2 py-1 bg-background rounded border border-border">
                {exercise.rest}s rest
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{exercise.note}</p>
          <div className="mt-3 p-3 rounded-md border border-primary/20 bg-background/60">
            {recommendation && recommendation.recommended_weight != null ? (
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 mt-0.5 text-primary shrink-0" fill="currentColor" />
                <div className="min-w-0">
                  <div className="font-display uppercase tracking-widest text-[11px] text-muted-foreground">
                    Today: Try{" "}
                    <span className="text-primary text-sm">
                      {Number(recommendation.recommended_weight)} lbs
                    </span>
                  </div>
                  <p className="mt-1 text-sm italic text-foreground/80">
                    "{recommendation.recommendation_reason}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 mt-0.5 text-primary shrink-0" fill="currentColor" />
                <p className="text-sm italic text-muted-foreground">
                  First time — use a weight that feels challenging but controlled.
                </p>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-display uppercase tracking-widest text-muted-foreground">
              {lastLog && lastLog.weight != null ? (
                <>
                  Last session:{" "}
                  <span className="text-foreground">
                    {lastLog.weight} lbs × {lastLog.reps_completed ?? lastLog.reps ?? "—"} reps
                  </span>
                  {difficultyEmoji && <span className="ml-2 text-base">— {difficultyEmoji}</span>}
                </>
              ) : (
                <span className="opacity-60">First time — give it your best</span>
              )}
            </div>
            {justLogged ? (
              <span className="px-3 py-1.5 text-xs font-display uppercase tracking-widest text-green-500 border border-green-500/50 rounded">
                Logged ✓
              </span>
            ) : (
              <button
                onClick={handleLog}
                className="px-3 py-1.5 text-xs font-display uppercase tracking-widest border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded"
              >
                Log this
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LogModal({
  exercise,
  onClose,
  onSave,
}: {
  exercise: Exercise;
  onClose: () => void;
  onSave: (payload: {
    weight: number | null;
    sets: number | null;
    reps: number | null;
    reps_completed: number | null;
    difficulty: "too_easy" | "just_right" | "too_hard";
  }) => Promise<void>;
}) {
  const [weight, setWeight] = useState("");
  const [sets, setSets] = useState(String(exercise.sets));
  const [reps, setReps] = useState(
    typeof exercise.reps === "number" ? String(exercise.reps) : "",
  );
  const [repsCompleted, setRepsCompleted] = useState(
    typeof exercise.reps === "number" ? String(exercise.reps) : "",
  );
  const [difficulty, setDifficulty] = useState<
    "too_easy" | "just_right" | "too_hard" | null
  >("just_right");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!difficulty) return;
    setSaving(true);
    setErr(null);
    try {
      await onSave({
        weight: weight ? Number(weight) : null,
        sets: sets ? parseInt(sets, 10) : null,
        reps: reps ? parseInt(reps, 10) : null,
        reps_completed: repsCompleted ? parseInt(repsCompleted, 10) : null,
        difficulty,
      });
    } catch (e) {
      setErr((e as Error).message);
      setSaving(false);
    }
  };

  const diffOptions: {
    value: "too_easy" | "just_right" | "too_hard";
    emoji: string;
    label: string;
  }[] = [
    { value: "too_easy", emoji: "😤", label: "Too Easy" },
    { value: "just_right", emoji: "💪", label: "Just Right" },
    { value: "too_hard", emoji: "😮‍💨", label: "Too Hard" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border border-border rounded-lg p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="font-display uppercase tracking-[0.3em] text-primary text-xs">Log set</div>
        <h2 className="mt-2 font-display uppercase text-2xl">{exercise.name}</h2>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Weight (lbs)" value={weight} onChange={setWeight} type="number" step="0.5" placeholder="e.g. 95" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sets completed" value={sets} onChange={setSets} type="number" />
            <Field label="Reps completed" value={reps} onChange={setReps} type="number" />
          </div>
          <Field
            label="Reps you actually completed"
            value={repsCompleted}
            onChange={setRepsCompleted}
            type="number"
            placeholder="What you actually did"
          />
          <div>
            <span className="block font-display uppercase tracking-widest text-[10px] text-muted-foreground mb-2">
              How did it feel?
            </span>
            <div className="grid grid-cols-3 gap-2">
              {diffOptions.map((opt) => {
                const active = difficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    className={`flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-md border-2 transition-all font-display uppercase tracking-wider text-[11px] ${
                      active
                        ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-red)]"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span className="text-2xl leading-none">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {err && <p className="text-sm text-primary">{err}</p>}
          <button
            type="submit"
            disabled={saving || !difficulty}
            className="w-full py-3 font-display uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary-glow rounded disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save log"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block font-display uppercase tracking-widest text-[10px] text-muted-foreground mb-1">
        {label}
      </span>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:border-primary outline-none"
      />
    </label>
  );
}

function cap(s: string | null | undefined) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">
        Loading…
      </div>
    </div>
  );
}

function NoPlanState() {
  return (
    <section className="max-w-2xl mx-auto px-4 md:px-8 py-20 text-center">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        No active plan
      </div>
      <h1 className="mt-4 font-display uppercase text-4xl md:text-5xl">
        Ready to <span className="text-primary">reignite</span>?
      </h1>
      <p className="mt-6 text-muted-foreground text-lg">
        You don't have an active membership yet. Pick a plan and let's get to work.
      </p>
      <Link
        to="/"
        hash="pricing"
        className="mt-10 inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-8 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all"
      >
        See plans
      </Link>
    </section>
  );
}
