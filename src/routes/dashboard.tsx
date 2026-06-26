import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Dashboard — FortyStrong" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, loading } = useSupabaseSession();
  const fetchAccount = useServerFn(getMyAccount);
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchAccount({}).then(setAccount).catch(() => setAccount(null));
    }
  }, [user, fetchAccount]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/login" });
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">
          Loading…
        </div>
      </main>
    );
  }

  const displayName =
    account?.fullName ||
    (user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    user.email;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-wider">
            FORTY<span className="text-primary">STRONG</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="font-display tracking-widest uppercase text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
          Welcome back
        </div>
        <h1 className="mt-4 font-display uppercase text-5xl md:text-7xl">
          {displayName}
        </h1>
        <p className="mt-6 text-muted-foreground text-lg max-w-2xl">
          Your training home base. Your plan, your progress, your next session — all here.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
          <Card title="Your Plan" body="Two lifts a week. Forty-five minutes each. Walks on the days in between." />
          <Card title="Next Session" body="Lift A — Lower body. Add 5 lbs on your hinge if last week felt strong." />
          <Card title="Progress" body="Log a session to start tracking your strength curve." />
        </div>
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-8 bg-surface border border-border rounded-lg">
      <h3 className="font-display text-2xl uppercase">{title}</h3>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}
