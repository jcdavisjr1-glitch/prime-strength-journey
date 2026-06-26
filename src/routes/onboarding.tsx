import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Welcome — FortyStrong" }],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="font-display tracking-widest uppercase text-muted-foreground text-sm">
          Loading…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center">
          <Link to="/" className="font-display text-2xl tracking-wider">
            FORTY<span className="text-primary">STRONG</span>
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="font-display uppercase tracking-[0.3em] text-primary text-sm">
          You're in
        </div>
        <h1 className="mt-4 font-display uppercase text-5xl md:text-7xl">
          Welcome to <span className="text-primary">FortyStrong</span>
        </h1>
        <p className="mt-6 text-muted-foreground text-lg">
          Your account is set. Your training home base is one tap away. Take a breath — then let's get to work.
        </p>

        <ol className="mt-10 space-y-4">
          <Step n="01" title="Check your inbox" body="Your welcome email has the next steps and your first session." />
          <Step n="02" title="Open your dashboard" body="Your plan, your next lift, and your progress live here." />
          <Step n="03" title="Lift twice this week" body="Forty-five minutes. Walks on the days in between." />
        </ol>

        <Link
          to="/dashboard"
          className="mt-12 inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-8 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all"
        >
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex gap-4 p-5 bg-surface border border-border rounded-lg">
      <div className="font-display text-primary text-xl">{n}</div>
      <div>
        <h3 className="font-display uppercase text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1">{body}</p>
      </div>
    </li>
  );
}
