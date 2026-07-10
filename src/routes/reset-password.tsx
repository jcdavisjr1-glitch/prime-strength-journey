import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — FortyStrong" },
      { name: "description", content: "Set a new password for your FortyStrong account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase's recovery link lands with tokens in the URL hash and
    // fires a PASSWORD_RECOVERY event once the session is established.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasSession(true);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateError) return setError(updateError.message);
    setInfo("Password updated. Redirecting…");
    setTimeout(() => navigate({ to: "/dashboard" }), 900);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center transition-[filter] duration-300 hover:drop-shadow-[0_0_14px_rgba(192,57,43,0.6)]">
          <Logo className="inline-flex" />
        </Link>
        <h1 className="mt-8 font-display uppercase text-4xl md:text-5xl text-center">
          Set a new <span className="text-primary">password</span>
        </h1>

        {ready && !hasSession ? (
          <div className="mt-10 space-y-4">
            <div className="text-sm text-primary border border-primary/40 bg-primary/10 rounded-sm px-3 py-3">
              This reset link is invalid or has expired. Request a new one from the login page.
            </div>
            <Link
              to="/login"
              className="block text-center w-full font-display tracking-wider uppercase text-base px-6 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-10 space-y-4">
            <label className="block">
              <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                New password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full bg-surface border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-foreground transition-colors"
              />
            </label>

            <label className="block">
              <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                Confirm password
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
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
              disabled={submitting || !hasSession}
              className="w-full font-display tracking-wider uppercase text-base px-6 py-4 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
