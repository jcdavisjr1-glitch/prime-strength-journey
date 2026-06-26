import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getCheckoutSessionEmail } from "@/utils/payments.functions";
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
  const [stripeEmail, setStripeEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || user || loading) return;
    fetchEmail({ data: { sessionId, environment: getStripeEnvironment() } })
      .then((res) => {
        if ("email" in res) setStripeEmail(res.email);
      })
      .catch(() => {});
  }, [sessionId, user, loading, fetchEmail]);

  const goSignup = () => {
    navigate({
      to: "/signup",
      search: stripeEmail ? { email: stripeEmail } : {},
    });
  };

  const showAccountPrompt = !loading && !user && !!sessionId;

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="max-w-xl text-center">
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
          <div className="mt-10 p-6 md:p-8 bg-surface border border-primary/40 rounded-lg text-left">
            <div className="font-display uppercase tracking-widest text-primary text-xs">
              One last step
            </div>
            <h2 className="mt-2 font-display text-2xl md:text-3xl uppercase">
              Create your account
            </h2>
            <p className="mt-3 text-muted-foreground">
              Set a password{stripeEmail ? ` for ${stripeEmail}` : ""} so your purchase is linked to your account and your training plan is ready next time you log in.
            </p>
            <button
              onClick={goSignup}
              className="mt-6 inline-flex items-center justify-center font-display tracking-wider uppercase text-base px-6 py-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary-glow shadow-[var(--shadow-red)] transition-all"
            >
              Create my account
            </button>
          </div>
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
