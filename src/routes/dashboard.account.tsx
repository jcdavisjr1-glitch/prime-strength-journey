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
  const runSync = useServerFn(syncMuscleWikiMedia);
  const [data, setData] = useState<Awaited<ReturnType<typeof getMyProfileAndAccess>> | null>(null);
  const [goal, setGoal] = useState<string>("60");
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalMsg, setGoalMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncErr, setSyncErr] = useState<string | null>(null);

  const handleRunSync = async () => {
    setSyncErr(null);
    setSyncing(true);
    try {
      const r = await runSync();
      setSyncResult(r);
    } catch (e) {
      setSyncErr(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setSyncing(false);
    }
  };

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

      <div className="mt-8 p-5 bg-surface border border-border rounded-lg">
        <div className="font-display tracking-widest uppercase text-xs text-muted-foreground">
          Exercise media sync
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Fetches demonstration videos from MuscleWiki for every exercise in the plan
          library and caches them. Run this manually — not on every page load — to stay
          within the API rate limit.
        </p>
        <button
          type="button"
          onClick={() => {
            setSyncResult(null);
            handleRunSync();
          }}
          disabled={syncing}
          className="mt-4 font-display tracking-wider uppercase text-sm px-5 py-2.5 rounded-sm border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
        >
          {syncing ? "Syncing…" : "Sync exercise videos"}
        </button>
        {syncErr && <div className="mt-3 text-sm text-destructive">{syncErr}</div>}
        {syncResult && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatTile label="Total" value={syncResult.total} />
              <StatTile label="Matched" value={syncResult.matched} accent />
              <StatTile label="Saved" value={syncResult.upserted} accent />
              <StatTile label="Unmatched" value={syncResult.unmatched.length} />
            </div>

            <div className="flex flex-wrap gap-2 font-display tracking-widest uppercase text-[10px]">
              <span className="px-2 py-1 rounded-sm bg-primary/10 text-primary border border-primary/40">
                {syncResult.total > 0
                  ? Math.round((syncResult.matched / syncResult.total) * 100)
                  : 0}
                % matched
              </span>
              <span className="px-2 py-1 rounded-sm bg-destructive/10 text-destructive border border-destructive/40">
                {syncResult.errors.length} error{syncResult.errors.length === 1 ? "" : "s"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRunSync}
              disabled={syncing}
              className="font-display tracking-wider uppercase text-xs px-4 py-2 rounded-sm border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
            >
              {syncing ? "Syncing…" : "Run sync again"}
            </button>



            {syncResult.unmatched.length > 0 && (
              <details className="rounded-sm border border-border bg-background/50" open>
                <summary className="cursor-pointer px-4 py-2 font-display tracking-widest uppercase text-xs text-muted-foreground">
                  No good match ({syncResult.unmatched.length})
                </summary>
                <ul className="px-4 pb-3 max-h-64 overflow-auto text-xs text-muted-foreground space-y-1">
                  {syncResult.unmatched.map((n) => (
                    <li key={n} className="font-mono">
                      {n}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {syncResult.errors.length > 0 && (
              <details
                className="rounded-sm border border-destructive/40 bg-destructive/5"
                open
              >
                <summary className="cursor-pointer px-4 py-2 font-display tracking-widest uppercase text-xs text-destructive">
                  Errors ({syncResult.errors.length})
                </summary>
                <ul className="px-4 pb-3 max-h-80 overflow-auto text-xs space-y-2">
                  {syncResult.errors.map((e, i) => (
                    <li
                      key={`${e.name}-${i}`}
                      className="border-l-2 border-destructive/60 pl-3"
                    >
                      <div className="font-display uppercase tracking-wider text-foreground">
                        {e.name}
                      </div>
                      <div className="font-mono text-destructive break-all">
                        {e.error}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>


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

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-sm border ${
        accent ? "border-primary/40 bg-primary/10" : "border-border bg-background/50"
      }`}
    >
      <div className="font-display tracking-widest uppercase text-[10px] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-3xl tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function cap(s: string | null | undefined) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
