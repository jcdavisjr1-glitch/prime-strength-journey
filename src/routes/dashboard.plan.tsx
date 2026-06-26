import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfileAndAccess } from "@/lib/profile.functions";
import { plans, type Exercise } from "@/lib/plans";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/plan")({
  ssr: false,
  head: () => ({ meta: [{ title: "My Plan — FortyStrong" }] }),
  component: MyPlan,
});

type Data = Awaited<ReturnType<typeof getMyProfileAndAccess>>;

function MyPlan() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const fetchData = useServerFn(getMyProfileAndAccess);
  const [data, setData] = useState<Data | null>(null);
  const [fetched, setFetched] = useState(false);
  const [activeDay, setActiveDay] = useState<"day1" | "day2">("day1");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

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
  }, [user, fetchData, navigate]);

  if (loading || !user || !fetched) {
    return <LoadingState />;
  }

  if (!data?.hasAccess) {
    return <NoPlanState />;
  }

  const level = data.profile?.fitness_level ?? "beginner";
  const equipment = data.profile?.equipment_type ?? "gym";

  const validLevels = ["beginner", "intermediate", "advanced"] as const;
  const validEquipment = ["gym", "home", "bodyweight"] as const;

  const safeLevel = validLevels.includes(level as (typeof validLevels)[number])
    ? (level as keyof typeof plans)
    : "beginner";
  const safeEquipment = validEquipment.includes(
    equipment as (typeof validEquipment)[number]
  )
    ? (equipment as "gym" | "home" | "bodyweight")
    : "gym";

  const plan = plans[safeLevel][safeEquipment];
  const day = plan[activeDay];

  const toggleExercise = (name: string) => {
    setCompleted((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const completedCount = day.exercises.filter((ex) => completed[ex.name]).length;
  const progress = Math.round((completedCount / day.exercises.length) * 100);

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        My Plan
      </div>
      <h1 className="mt-4 font-display uppercase text-4xl md:text-6xl">
        {day.name}
      </h1>
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
        <button
          onClick={() => setActiveDay("day1")}
          className={`py-3 px-4 text-center font-display uppercase tracking-widest text-sm border transition-all ${
            activeDay === "day1"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          Day A
        </button>
        <button
          onClick={() => setActiveDay("day2")}
          className={`py-3 px-4 text-center font-display uppercase tracking-widest text-sm border transition-all ${
            activeDay === "day2"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          Day B
        </button>
      </div>

      <div className="mt-10 space-y-4">
        {day.exercises.map((exercise: Exercise, index: number) => (
          <ExerciseCard
            key={exercise.name + index}
            exercise={exercise}
            index={index}
            completed={!!completed[exercise.name]}
            onToggle={() => toggleExercise(exercise.name)}
          />
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Alternate Day A and Day B with at least one rest day between lifting
        sessions. Outside lifting days, walk 20–30 minutes.
      </p>
    </section>
  );
}

function ExerciseCard({
  exercise,
  index,
  completed,
  onToggle,
}: {
  exercise: Exercise;
  index: number;
  completed: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`group flex items-start gap-4 p-4 md:p-5 rounded-lg border cursor-pointer transition-all ${
        completed
          ? "bg-primary/5 border-primary/30"
          : "bg-surface border-border hover:border-primary/40"
      }`}
    >
      <div
        className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground group-hover:border-primary"
        }`}
      >
        {completed && <CheckCircle2 className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
          <h3
            className={`font-display uppercase text-lg ${
              completed ? "text-muted-foreground line-through" : "text-foreground"
            }`}
          >
            {index + 1}. {exercise.name}
          </h3>
          <div className="flex items-center gap-3 font-display uppercase text-xs tracking-wider text-muted-foreground">
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
      </div>
    </div>
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
