import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//") ? s.next : "",
  }),
  head: () => ({
    meta: [
      { title: "Log In — FortyStrong" },
      { name: "description", content: "Log in to your FortyStrong account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) return setError("Invalid email or password.");
    if (next) {
      window.location.href = next;
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const onForgot = async () => {
    setError(null);
    setInfo(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError("Enter your email above first, then click Forgot password.");
    }
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (resetError) return setError(resetError.message);
    setInfo("Password reset email sent. Check your inbox.");
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgba(192,57,43,0.6)]">
          <Logo className="inline-flex" />
        </Link>
        <h1 className="mt-8 font-display uppercase text-4xl md:text-5xl text-center">
          Welcome <span className="text-primary">back</span>
        </h1>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <label className="block">
            <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-2 w-full bg-surface border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-foreground transition-colors"
            />
          </label>

          <label className="block">
            <div className="flex items-baseline justify-between">
              <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                Password
              </span>
              <button
                type="button"
                onClick={onForgot}
                className="text-xs text-primary hover:underline font-display tracking-widest uppercase"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-2 w-full bg-surface border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-foreground transition-colors"
            />
          </label>

          {error && (
            <div className="text-sm text-primary border border-primary/40 bg-primary/10 rounded-sm px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm text-foreground border border-border bg-surface rounded-sm px-3 py-2">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-display tracking-wider uppercase text-base px-6 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/" className="text-primary hover:underline font-display tracking-wider uppercase">
            Choose a plan
          </Link>{" "}
          to get started — accounts are created at checkout.
        </p>
      </div>
    </main>
  );
}
