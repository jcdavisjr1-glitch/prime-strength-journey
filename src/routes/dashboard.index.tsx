import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfileAndAccess } from "@/lib/profile.functions";
import { getMyWalkingLogs } from "@/lib/walking-logs.functions";
import { Footprints } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  ssr: false,
  component: DashboardHome,
});

type Data = Awaited<ReturnType<typeof getMyProfileAndAccess>>;

function DashboardHome() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const fetchData = useServerFn(getMyProfileAndAccess);
  const fetchWalks = useServerFn(getMyWalkingLogs);
  const [data, setData] = useState<Data | null>(null);
  const [walks, setWalks] = useState<{ logged_date: string; duration_minutes: number }[]>([]);
  const [fetched, setFetched] = useState(false);

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
    fetchWalks({}).then((w) => setWalks(w as typeof walks)).catch(() => {});
  }, [user, fetchData, fetchWalks, navigate]);

  if (loading || !user || !fetched) {
    return <LoadingState />;
  }

  if (!data?.hasAccess) {
    return <NoPlanState />;
  }

  const fullName = data.profile?.full_name || data.email || "";
  const firstName = fullName.split(" ")[0] || "Friend";
  const level = data.profile?.fitness_level;
  const equip = data.profile?.equipment_type;
  const badge = [level, equip].filter(Boolean).map(cap).join(" · ");

  const days = [
    { d: "Mon", label: "Lift A", type: "lift" },
    { d: "Tue", label: "Walk", type: "rest" },
    { d: "Wed", label: "Lift B", type: "lift" },
    { d: "Thu", label: "Walk", type: "rest" },
    { d: "Fri", label: "Rest", type: "rest" },
    { d: "Sat", label: "Walk", type: "rest" },
    { d: "Sun", label: "Rest", type: "rest" },
  const walkGoal = data.profile?.weekly_walking_goal_minutes ?? 60;
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const diff = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - diff);
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  }, []);
  const walkWeekTotal = walks
    .filter((w) => w.logged_date >= weekStart)
    .reduce((s, w) => s + w.duration_minutes, 0);
  const walkPct = walkGoal > 0 ? Math.min(100, Math.round((walkWeekTotal / walkGoal) * 100)) : 0;


  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        Welcome back
      </div>
      <h1 className="mt-4 font-display uppercase text-4xl md:text-6xl">
        {firstName}. <span className="text-muted-foreground">Let's get stronger.</span>
      </h1>
      {badge && (
        <div className="mt-6 inline-flex items-center px-4 py-2 border border-primary/40 bg-primary/10 rounded-full font-display tracking-widest uppercase text-xs text-primary">
          {badge}
        </div>
      )}

      <div className="mt-12">
        <h2 className="font-display uppercase text-2xl">This Week</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-7 gap-3">
          {days.map((day) => (
            <div
              key={day.d}
              className={`p-4 rounded-lg border ${
                day.type === "lift"
                  ? "bg-primary/10 border-primary/40"
                  : "bg-surface border-border"
              }`}
            >
              <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                {day.d}
              </div>
              <div
                className={`mt-2 font-display uppercase text-lg ${
                  day.type === "lift" ? "text-primary" : "text-foreground"
                }`}
              >
                {day.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
