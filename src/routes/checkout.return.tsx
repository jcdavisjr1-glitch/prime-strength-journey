import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getCheckoutSessionEmail } from "@/utils/payments.functions";
import { linkCheckoutToUser } from "@/lib/link-purchase.functions";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useSupabaseSession();
  const fetchEmail = useServerFn(getCheckoutSessionEmail);
  const linkPurchase = useServerFn(linkCheckoutToUser);

  const [stripeEmail, setStripeEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linked, setLinked] = useState(false);

  const env = getStripeEnvironment();

  // Fetch email for the create-account form
  useEffect(() => {
    if (!sessionId || user || loading) return;
    fetchEmail({ data: { sessionId, environment: env } })
      .then((res) => {
        if ("email" in res) setStripeEmail(res.email);
      })
      .catch(() => {});
  }, [sessionId, user, loading, fetchEmail, env]);

  // If a session already exists when they land here (returning customer
  // buying a second plan), link this new purchase to them silently.
  useEffect(() => {
    if (!user || !sessionId || linked) return;
    linkPurchase({ data: { sessionId, environment: env } })
      .then(() => setLinked(true))
      .catch(() => setLinked(true));
  }, [user, sessionId, linked, linkPurchase, env]);

  const onCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripeEmail) return setError("We couldn't find your email. Refresh and try again.");
    if (!fullName.trim()) return setError("Please tell us what to call you.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: stripeEmail,
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (signUpError) {
      setSubmitting(false);
      return setError(signUpError.message);
    }

    // Ensure we have a session (auto-confirm is on, but signUp may not
    // always return a session in every flow — sign in to guarantee it).
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: stripeEmail,
        password,
      });
      if (signInError) {
        setSubmitting(false);
        return setError(signInError.message);
      }
    }

    // Link the just-completed Stripe purchase to the new user.
    if (sessionId) {
      try {
        await linkPurchase({ data: { sessionId, environment: env } });
      } catch {
        // non-fatal; the webhook will eventually catch up
      }
    }

    setSubmitting(false);
    navigate({ to: "/onboarding" });
  };

  const showAccountPrompt = !loading && !user && !!sessionId;

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <div className="font-display uppercase tracking-widest text-primary text-sm">
          Welcome to FortyStrong
        </div>
        <h1 className="mt-4 font-display text-5xl md:text-7xl uppercase">You're in.</h1>
        <p className="mt-6 text-muted-foreground text-lg">
          {sessionId
            ? "Payment complete. Check your inbox — your onboarding email is on the way."
            : "Your order is being processed."}
        </p>

        {showAccountPrompt && (
          <form
            onSubmit={onCreateAccount}
            className="mt-10 p-6 md:p-8 bg-surface border border-primary/40 rounded-lg text-left"
          >
            <div className="font-display uppercase tracking-widest text-primary text-xs">
              One last step
            </div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl uppercase">
              Create your account
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Set a password so your purchase stays linked to your account.
            </p>

            <label className="block mt-6">
              <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                value={stripeEmail ?? ""}
                readOnly
                className="mt-2 w-full bg-background border border-border rounded-sm px-4 py-3 text-muted-foreground cursor-not-allowed"
              />
            </label>

            <label className="block mt-4">
              <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                What should we call you?
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
                className="mt-2 w-full bg-background border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-foreground transition-colors"
              />
            </label>

            <label className="block mt-4">
              <span className="font-display tracking-widest uppercase text-xs text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full bg-background border border-border focus:border-primary outline-none rounded-sm px-4 py-3 text-foreground transition-colors"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                Minimum 8 characters.
              </span>
            </label>

            {error && (
              <div className="mt-4 text-sm text-primary border border-primary/40 bg-primary/10 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !stripeEmail}
              className="mt-6 w-full inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create my account"}
            </button>
          </form>
        )}

        {!loading && user && (
          <Link
            to="/dashboard"
            className="inline-block mt-10 font-display uppercase tracking-widest text-sm bg-primary text-primary-foreground px-8 py-4 rounded-md"
          >
            Go to dashboard
          </Link>
        )}

        {!showAccountPrompt && !user && (
          <Link
            to="/"
            className="inline-block mt-10 font-display uppercase tracking-widest text-sm bg-primary text-primary-foreground px-8 py-4 rounded-md"
          >
            Back to home
          </Link>
        )}
      </div>
    </main>
  );
}
