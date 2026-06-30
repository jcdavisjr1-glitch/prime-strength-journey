import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfileAndAccess } from "@/lib/profile.functions";
import { updateWalkingGoal } from "@/lib/walking-logs.functions";
import { syncMuscleWikiMedia, type SyncResult } from "@/lib/exercise-media-sync.functions";

export const Route = createFileRoute("/dashboard/account")({
  ssr: false,
  head: () => ({ meta: [{ title: "Account — FortyStrong" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, loading } = useSupabaseSession();
  const fetchData = useServerFn(getMyProfileAndAccess);
  const saveGoal = useServerFn(updateWalkingGoal);
  const [data, setData] = useState<Awaited<ReturnType<typeof getMyProfileAndAccess>> | null>(null);
  const [goal, setGoal] = useState<string>("60");
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalMsg, setGoalMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchData({})
        .then((d) => {
          setData(d);
          setGoal(String(d.profile?.weekly_walking_goal_minutes ?? 60));
        })
        .catch(() => {});
    }
  }, [user, fetchData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/login" });
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalMsg(null);
    const n = Number(goal);
    if (!Number.isFinite(n) || n < 0) {
      setGoalMsg("Enter a valid number.");
      return;
    }
    setSavingGoal(true);
    try {
      await saveGoal({ data: { weekly_walking_goal_minutes: Math.round(n) } });
      setGoalMsg("Saved.");
    } catch (err) {
      setGoalMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">
          Loading…
        </div>
      </div>
    );
  }

  const planLabel = data?.subscription
    ? `${data.subscription.status}${data.subscription.cancel_at_period_end ? " (canceling)" : ""}`
    : data?.lifetimePurchase
      ? "Lifetime access"
      : "No active plan";

  return (
    <section className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
        Account
      </div>
      <h1 className="mt-4 font-display uppercase text-4xl md:text-5xl">Your details</h1>

      <div className="mt-10 grid gap-4">
        <Field label="Full name" value={data?.profile?.full_name || "—"} />
        <Field label="Email" value={data?.email || user.email || "—"} />
        <Field label="Plan" value={planLabel} />
        <Field
          label="Fitness level"
          value={cap(data?.profile?.fitness_level) || "Not set"}
        />
        <Field
          label="Equipment"
          value={cap(data?.profile?.equipment_type) || "Not set"}
        />
      </div>

      <form onSubmit={handleSaveGoal} className="mt-8 p-5 bg-surface border border-border rounded-lg">
        <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">
          Weekly walking goal
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0}
            max={10000}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-28 px-4 py-3 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary"
          />
          <span className="text-muted-foreground">minutes / week</span>
          <button
            type="submit"
            disabled={savingGoal}
            className="ml-auto font-display tracking-wider uppercase text-sm px-5 py-2.5 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow transition-colors disabled:opacity-60"
          >
            {savingGoal ? "Saving…" : "Save"}
          </button>
        </div>
        {goalMsg && <div className="mt-3 text-sm text-muted-foreground">{goalMsg}</div>}
      </form>

      <button
        onClick={signOut}
        className="mt-12 font-display tracking-wider uppercase text-base px-8 py-4 rounded-sm border border-border hover:border-primary hover:text-primary transition-colors"
      >
        Sign out
      </button>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 bg-surface border border-border rounded-lg">
      <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-lg">{value}</div>
    </div>
  );
}

function cap(s: string | null | undefined) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
