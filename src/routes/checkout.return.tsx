import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <div className="font-display uppercase tracking-widest text-primary text-sm">
          Welcome to FortyStrong
        </div>
        <h1 className="mt-4 font-display text-5xl md:text-7xl uppercase">
          You're in.
        </h1>
        <p className="mt-6 text-muted-foreground text-lg">
          {sessionId
            ? "Payment complete. Check your inbox — your onboarding email is on the way."
            : "Your order is being processed."}
        </p>
        <Link
          to="/"
          className="inline-block mt-10 font-display uppercase tracking-widest text-sm bg-primary text-primary-foreground px-8 py-4 rounded-md"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
